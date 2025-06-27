import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { generateRandomString, hashString, createErrorResponse } from '@/lib/utils'

const logAudit = async (supabase: any, status: 'SUCCESS' | 'FAILURE', details: any, user_id?: string, client_id?: string) => {
    await supabase.from('audit_logs').insert({ event_type: 'AUTHORIZATION_REQUEST', status, user_id, client_id, details });
}

// --- FUNGSI HELPER ---

async function validateClient(supabase: any, client_id: string, redirect_uri: string, response_type: string, scope: string) {
    const { data: clientData, error: clientError } = await supabase.from('clients').select('*').eq('client_id', client_id).single();
    if (clientError || !clientData || !clientData.is_active) {
        return { error: { message: 'ID klien tidak valid atau tidak aktif.', code: 'unauthorized_client' } };
    }
    if (!clientData.redirect_uris.includes(redirect_uri)) {
        return { error: { message: 'URI pengalihan tidak valid.', code: 'invalid_redirect_uri' } };
    }
    if (!clientData.response_types.includes(response_type)) {
        return { error: { message: `Tipe respons '${response_type}' tidak didukung oleh klien ini.`, code: 'unsupported_response_type' } };
    }
    const requestedScopes = scope.split(' ');
    const allowedScopes = clientData.scope.split(' ');
    const invalidScopes = requestedScopes.filter(s => !allowedScopes.includes(s));
    if (invalidScopes.length > 0) {
        return { error: { message: `Scope yang diminta tidak valid: ${invalidScopes.join(', ')}.`, code: 'invalid_scope' } };
    }
    return { clientData, requestedScopes };
}

async function generateAndStoreAuthCode(supabase: any, user_id: string, client_id: string, redirect_uri: string, scopes: string[], nonce?: string, code_challenge?: string, code_challenge_method?: string) {
    const authorizationCode = generateRandomString(40);
    const codeHash = hashString(authorizationCode);
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    const { error } = await supabase.from('authorization_codes').insert({ code_hash: codeHash, user_id, client_id, redirect_uri, scopes, expires_at: expiresAt, code_challenge, code_challenge_method, nonce });
    if (error) return { error: { message: 'Gagal menyimpan kode otorisasi.', code: 'server_error' } };
    return { authorizationCode };
}

// --- MAIN HANDLER ---

export async function GET(request: Request) {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    const params = Object.fromEntries(searchParams.entries());
    const { response_type, client_id, redirect_uri, scope, state, nonce, code_challenge, code_challenge_method, prompt, consent_given } = params;

    if (!response_type || !client_id || !redirect_uri || !scope) {
        const missing = [!response_type && 'response_type', !client_id && 'client_id', !redirect_uri && 'redirect_uri', !scope && 'scope'].filter(Boolean).join(', ');
        const error_description = `Parameter wajib tidak ditemukan: ${missing}.`;
        if (!redirect_uri) return createErrorResponse(error_description, 400, 'invalid_request');
        const errorUrl = new URL(redirect_uri);
        errorUrl.searchParams.set('error', 'invalid_request');
        errorUrl.searchParams.set('error_description', error_description);
        if (state) errorUrl.searchParams.set('state', state);
        return NextResponse.redirect(errorUrl);
    }

    const { clientData, requestedScopes, error: clientValidationError } = await validateClient(supabase, client_id, redirect_uri, response_type, scope);
    if (clientValidationError) {
        const errorUrl = new URL(redirect_uri);
        errorUrl.searchParams.set('error', clientValidationError.code);
        errorUrl.searchParams.set('error_description', clientValidationError.message);
        if (state) errorUrl.searchParams.set('state', state);
        await logAudit(supabase, 'FAILURE', { error: clientValidationError.message, client_id });
        return NextResponse.redirect(errorUrl);
    }
    
    // Validasi PKCE untuk klien publik
    if (clientData!.token_endpoint_auth_method === 'none' && !code_challenge) {
        const error_description = 'Klien publik wajib menggunakan PKCE (code_challenge diperlukan).';
        const errorUrl = new URL(redirect_uri);
        errorUrl.searchParams.set('error', 'invalid_request');
        errorUrl.searchParams.set('error_description', error_description);
        if (state) errorUrl.searchParams.set('state', state);
        return NextResponse.redirect(errorUrl);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        const loginUrl = new URL(`${siteUrl}/login`);
        searchParams.forEach((value, key) => loginUrl.searchParams.set(key, value));
        return NextResponse.redirect(loginUrl);
    }

    const { data: authData } = await supabase.from('authorizations').select('scopes_granted').eq('user_id', user.id).eq('client_id', client_id).single();
    const previouslyGrantedScopes = authData?.scopes_granted || [];
    const allScopesGranted = requestedScopes!.every(s => previouslyGrantedScopes.includes(s));

    if (consent_given) {
        await supabase.from('authorizations').upsert({ user_id: user.id, client_id, scopes_granted: requestedScopes, last_updated_at: new Date() }, { onConflict: 'user_id,client_id' });
    } else if (!allScopesGranted || prompt === 'consent') {
        const consentUrl = new URL(`${siteUrl}/consent`);
        searchParams.forEach((value, key) => consentUrl.searchParams.set(key, value));
        return NextResponse.redirect(consentUrl);
    }

    const { authorizationCode, error: codeError } = await generateAndStoreAuthCode(supabase, user.id, client_id, redirect_uri, requestedScopes!, nonce, code_challenge, code_challenge_method);
    if (codeError) {
        const errorUrl = new URL(redirect_uri);
        errorUrl.searchParams.set('error', codeError.code);
        errorUrl.searchParams.set('error_description', codeError.message);
        if (state) errorUrl.searchParams.set('state', state);
        await logAudit(supabase, 'FAILURE', { error: codeError.message }, user.id, client_id);
        return NextResponse.redirect(errorUrl);
    }
    
    const finalRedirectUrl = new URL(redirect_uri);
    finalRedirectUrl.searchParams.set('code', authorizationCode!);
    if (state) finalRedirectUrl.searchParams.set('state', state);
    await logAudit(supabase, 'SUCCESS', { requested_scopes: scope }, user.id, client_id);
    return NextResponse.redirect(finalRedirectUrl);
}
