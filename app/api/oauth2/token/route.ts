import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { hashString, verifyHash, generateRandomString, createErrorResponse } from '@/lib/utils'
import { getPrivateKey, getKeyId } from '@/lib/keys'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// --- Tipe Data & Helper ---

type GrantHandlerResult = { data: { userId: string | null; scopes: string[]; nonce: string | null; }; error?: undefined; } | { error: NextResponse; data?: undefined; };

const logAudit = async (supabase: any, status: 'SUCCESS' | 'FAILURE', event_details: any, user_id?: string | null, client_id?: string) => {
  await supabase.from('audit_logs').insert({ event_type: 'TOKEN_EXCHANGE', status, user_id, client_id, details: event_details });
}

// --- FUNGSI HELPER UNTUK SETIAP GRANT TYPE ---

async function handleAuthorizationCode(supabase: any, code: string, redirect_uri: string, code_verifier: string, client_id: string): Promise<GrantHandlerResult> {
    if (!code || !redirect_uri || !code_verifier) return { error: createErrorResponse('Parameter wajib untuk authorization_code grant tidak ditemukan.', 400, 'invalid_request') };
    const codeHash = hashString(code);
    const { data: authCodeData, error: authCodeError } = await supabase.from('authorization_codes').select('*').eq('code_hash', codeHash).single();
    if (authCodeError || !authCodeData || authCodeData.used_at || new Date() > new Date(authCodeData.expires_at) || authCodeData.client_id !== client_id) {
        if (authCodeData) await supabase.from('refresh_tokens').update({ revoked_at: new Date() }).match({ user_id: authCodeData.user_id, client_id: authCodeData.client_id });
        return { error: createErrorResponse('Kode otorisasi tidak valid, sudah digunakan, atau kadaluarsa.', 400, 'invalid_grant') };
    }
    if (authCodeData.code_challenge && authCodeData.code_challenge_method === 'S256') {
        const hashedVerifier = crypto.createHash('sha256').update(code_verifier).digest('base64url');
        if (hashedVerifier !== authCodeData.code_challenge) return { error: createErrorResponse('Code verifier tidak valid.', 400, 'invalid_grant') };
    }
    await supabase.from('authorization_codes').update({ used_at: new Date() }).eq('id', authCodeData.id);
    return { data: { userId: authCodeData.user_id, scopes: authCodeData.scopes, nonce: authCodeData.nonce } };
}

async function handleRefreshToken(supabase: any, refresh_token: string, client_id: string, scope?: string): Promise<GrantHandlerResult> {
    if (!refresh_token) return { error: createErrorResponse('Refresh token diperlukan.', 400, 'invalid_request') };
    const tokenHash = hashString(refresh_token);
    const { data: tokenData, error: tokenError } = await supabase.from('refresh_tokens').select('*').eq('token_hash', tokenHash).single();
    if (tokenError || !tokenData || tokenData.revoked_at || new Date() > new Date(tokenData.expires_at) || tokenData.client_id !== client_id) return { error: createErrorResponse('Refresh token tidak valid, sudah dicabut, atau kadaluarsa.', 400, 'invalid_grant') };
    await supabase.from('refresh_tokens').update({ revoked_at: new Date(), parent_token_hash: tokenHash }).eq('id', tokenData.id);
    const requestedScopes = scope ? scope.split(' ') : tokenData.scopes;
    const grantedScopes = requestedScopes.filter((s: string) => tokenData.scopes.includes(s));
    return { data: { userId: tokenData.user_id, scopes: grantedScopes, nonce: null } };
}

async function handleClientCredentials(clientData: any, scope?: string): Promise<GrantHandlerResult> {
    const defaultScopes = clientData.scope.split(' ');
    const requestedScopes = scope ? scope.split(' ') : defaultScopes;
    const grantedScopes = requestedScopes.filter((s: string) => defaultScopes.includes(s));
    return { data: { userId: null, scopes: grantedScopes, nonce: null } };
}

async function handlePassword(supabase: any, username?: string, password?: string, scope?: string): Promise<GrantHandlerResult> {
    if (!username || !password) return { error: createErrorResponse('Username dan password diperlukan.', 400, 'invalid_request') };
    const { data, error } = await supabase.auth.signInWithPassword({ email: username, password });
    if (error || !data.user) return { error: createErrorResponse('Kredensial pengguna tidak valid.', 400, 'invalid_grant') };
    const requestedScopes = scope ? scope.split(' ') : ['openid', 'profile', 'email'];
    return { data: { userId: data.user.id, scopes: requestedScopes, nonce: null } };
}

// --- MAIN HANDLER ---

export async function POST(request: Request) {
    const supabase = createSupabaseServerClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const formData = await request.formData();

    const grant_type = formData.get('grant_type') as string;
    let client_id = formData.get('client_id') as string;
    let client_secret = formData.get('client_secret') as string;

    const authHeader = request.headers.get('authorization');
    if (authHeader?.toLowerCase().startsWith('basic ')) {
        const decoded = Buffer.from(authHeader.substring(6), 'base64').toString('utf8');
        const [headerClientId, headerClientSecret] = decoded.split(':', 2);
        client_id = headerClientId || client_id;
        client_secret = headerClientSecret || client_secret;
    }

    if (!grant_type || !client_id) return createErrorResponse('Parameter wajib grant_type atau client_id tidak ditemukan.', 400, 'invalid_request');

    const { data: clientData, error: clientError } = await supabase.from('clients').select('*').eq('client_id', client_id).single();
    if (clientError || !clientData || !clientData.is_active) return createErrorResponse('Klien tidak valid atau tidak aktif.', 401, 'unauthorized_client');
    if (clientData.token_endpoint_auth_method !== 'none' && (!client_secret || !verifyHash(client_secret, clientData.client_secret_hash))) return createErrorResponse('Secret klien tidak valid.', 401, 'unauthorized_client');
    if (!clientData.grant_types.includes(grant_type)) return createErrorResponse(`Tipe grant '${grant_type}' tidak didukung oleh klien ini.`, 400, 'unsupported_grant_type');

    let result: GrantHandlerResult;
    switch (grant_type) {
        case 'authorization_code':
            result = await handleAuthorizationCode(supabase, formData.get('code') as string, formData.get('redirect_uri') as string, formData.get('code_verifier') as string, client_id);
            break;
        case 'refresh_token':
            result = await handleRefreshToken(supabase, formData.get('refresh_token') as string, client_id, formData.get('scope') as string | undefined);
            break;
        case 'client_credentials':
            result = await handleClientCredentials(clientData, formData.get('scope') as string | undefined);
            break;
        case 'password':
            result = await handlePassword(supabase, formData.get('username') as string, formData.get('password') as string, formData.get('scope') as string | undefined);
            break;
        default:
            return createErrorResponse(`Tipe grant '${grant_type}' tidak didukung.`, 400, 'unsupported_grant_type');
    }

    if (result.error) {
        const errorBody = await result.error.json();
        await logAudit(supabase, 'FAILURE', { error: errorBody.error, grant_type, client_id });
        return result.error;
    }
    
    const { userId, scopes, nonce } = result.data;

    const { data: settings } = await supabase.from('system_settings').select('key, value').in('key', ['token_lifetimes']);
    const tokenLifetimes = settings?.find((s: any) => s.key === 'token_lifetimes')?.value || { access_token: 3600, refresh_token: 604800 };

    const { data: userProfile } = userId ? await supabase.from('auth.users').select('id, email, email_confirmed_at, raw_user_meta_data, updated_at').eq('id', userId).single() : { data: null };

    const privateKey = getPrivateKey();
    const kid = getKeyId();
    const accessTokenPayload = { iss: siteUrl, sub: userId || client_id, aud: client_id, exp: Math.floor(Date.now() / 1000) + tokenLifetimes.access_token, iat: Math.floor(Date.now() / 1000), jti: generateRandomString(16), scope: scopes.join(' '), client_id };
    const access_token = jwt.sign(accessTokenPayload, privateKey, { algorithm: 'RS256', keyid: kid });

    let id_token;
    if (scopes.includes('openid') && userProfile) {
        const idTokenPayload = { iss: siteUrl, sub: userProfile.id, aud: client_id, exp: Math.floor(Date.now() / 1000) + tokenLifetimes.access_token, iat: Math.floor(Date.now() / 1000), nonce, auth_time: userProfile.updated_at ? Math.floor(new Date(userProfile.updated_at).getTime() / 1000) : undefined, email: scopes.includes('email') ? userProfile.email : undefined, email_verified: scopes.includes('email') ? !!userProfile.email_confirmed_at : undefined, name: scopes.includes('profile') ? userProfile.raw_user_meta_data?.full_name : undefined, picture: scopes.includes('profile') ? userProfile.raw_user_meta_data?.picture : undefined };
        id_token = jwt.sign(idTokenPayload, privateKey, { algorithm: 'RS256', keyid: kid });
    }

    let new_refresh_token;
    if (userId && clientData.grant_types.includes('refresh_token')) {
        new_refresh_token = generateRandomString(64);
        const { error } = await supabase.from('refresh_tokens').insert({ token_hash: hashString(new_refresh_token), user_id: userId, client_id, scopes, expires_at: new Date(Date.now() + tokenLifetimes.refresh_token * 1000).toISOString() });
        if (error) return createErrorResponse('Gagal menerbitkan refresh token.', 500, 'server_error');
    }

    await logAudit(supabase, 'SUCCESS', { grant_type, client_id, issued_scopes: scopes.join(' ') }, userId);

    const responseBody: any = { access_token, token_type: 'Bearer', expires_in: tokenLifetimes.access_token, scope: scopes.join(' ') };
    if (new_refresh_token) responseBody.refresh_token = new_refresh_token;
    if (id_token) responseBody.id_token = id_token;

    return NextResponse.json(responseBody);
}
