import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createErrorResponse } from '@/lib/utils';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return createErrorResponse('Sesi pengguna tidak ditemukan atau tidak valid.', 401, 'UNAUTHORIZED');
  }

  const formData = await req.formData();
  const searchParams = new URLSearchParams(formData as any);
  
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const consentDecision = searchParams.get('consent');

  if (!clientId || !redirectUri || !consentDecision) {
    return createErrorResponse('Parameter yang diperlukan tidak lengkap.', 400, 'INVALID_REQUEST');
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, redirect_uris')
    .eq('client_id', clientId)
    .single();

  if (clientError || !client || !client.redirect_uris.includes(redirectUri)) {
    return createErrorResponse('Klien tidak valid atau redirect_uri tidak cocok.', 400, 'INVALID_CLIENT');
  }
  
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

  await supabase.from('audit_logs').insert({
    event_type: consentDecision === 'approved' ? 'CONSENT_APPROVED' : 'CONSENT_DENIED',
    status: 'SUCCESS',
    user_id: user.id,
    client_id: clientId,
    details: { 
        message: `Pengguna ${consentDecision === 'approved' ? 'menyetujui' : 'menolak'} persetujuan`,
        params: Object.fromEntries(searchParams.entries())
    },
    ip_address: ipAddress,
  });


  if (consentDecision === 'denied') {
    const destination = new URL(redirectUri);
    destination.searchParams.set('error', 'access_denied');
    destination.searchParams.set('error_description', 'Pengguna menolak akses.');
    if (state) destination.searchParams.set('state', state);
    return NextResponse.json({ redirect_to: destination.toString() });
  }

  const authorizeUrl = new URL(req.nextUrl.origin);
  authorizeUrl.pathname = '/api/oauth2/authorize';
  authorizeUrl.search = searchParams.toString();

  return NextResponse.json({ redirect_to: authorizeUrl.toString() });
}
