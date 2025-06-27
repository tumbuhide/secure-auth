import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getPublicKey } from '@/lib/keys'
import { createErrorResponse } from '@/lib/utils'
import * as jose from 'jose'

const logAudit = async (supabase: any, status: 'SUCCESS' | 'FAILURE', details: any, user_id?: string | null, client_id?: string | null) => {
    await supabase.from('audit_logs').insert({ event_type: 'USERINFO_REQUEST', status, user_id, client_id, details });
}

export async function GET(request: Request) {
    const supabase = createSupabaseServerClient();
    const authHeader = request.headers.get('authorization');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
        await logAudit(supabase, 'FAILURE', { error: 'Header otorisasi tidak ditemukan atau format tidak valid' });
        const response = createErrorResponse('Access token tidak ditemukan atau format tidak valid.', 401, 'invalid_token');
        response.headers.set('WWW-Authenticate', 'Bearer');
        return response;
    }

    const accessToken = authHeader.substring(7);
    let payload: jose.JWTPayload;

    try {
        const publicKey = await jose.importSPKI(getPublicKey(), 'RS256');
        const { payload: verifiedPayload } = await jose.jwtVerify(accessToken, publicKey, { issuer: siteUrl });
        payload = verifiedPayload;
    } catch (err: any) {
        await logAudit(supabase, 'FAILURE', { error: 'Verifikasi access token gagal', token_error: err.message });
        const response = createErrorResponse('Access token tidak valid atau kadaluarsa.', 401, 'invalid_token');
        response.headers.set('WWW-Authenticate', 'Bearer error="invalid_token"');
        return response;
    }

    const userId = payload.sub;
    const clientId = typeof payload.aud === 'string' ? payload.aud : null;
    const grantedScopes = typeof payload.scope === 'string' ? payload.scope.split(' ') : [];

    if (!userId) {
        await logAudit(supabase, 'FAILURE', { error: 'Access token tidak mengandung subject (sub)', clientId: clientId });
        return createErrorResponse('Access token tidak valid: sub tidak ditemukan.', 401, 'invalid_token');
    }

    const { data: userProfile, error: profileError } = await supabase.from('auth.users').select('id, email, email_confirmed_at, raw_user_meta_data, updated_at').eq('id', userId).single();

    if (profileError || !userProfile) {
        await logAudit(supabase, 'FAILURE', { error: 'Gagal mengambil profil pengguna', user_id: userId, clientId: clientId, db_error: profileError?.message });
        return createErrorResponse('Gagal mengambil informasi profil pengguna.', 500, 'server_error');
    }

    const userInfo: { [key: string]: any } = { sub: userProfile.id };
    const metaData = (userProfile.raw_user_meta_data as { [key: string]: any }) || {};

    if (grantedScopes.includes('profile')) {
        Object.assign(userInfo, {
            name: metaData.full_name,
            given_name: metaData.given_name,
            family_name: metaData.family_name,
            picture: metaData.picture,
            locale: metaData.locale,
            zoneinfo: metaData.zoneinfo
        });
    }
    if (grantedScopes.includes('email')) {
        Object.assign(userInfo, { email: userProfile.email, email_verified: !!userProfile.email_confirmed_at });
    }
    if (userProfile.updated_at) {
        userInfo.updated_at = Math.floor(new Date(userProfile.updated_at).getTime() / 1000);
    }
    
    await logAudit(supabase, 'SUCCESS', { requested_scopes: grantedScopes.join(' ') }, userId, clientId);
    return NextResponse.json(userInfo);
}

export async function POST(request: Request) {
    return GET(request);
}
