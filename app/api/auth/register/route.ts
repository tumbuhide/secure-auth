import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createErrorResponse } from '@/lib/utils'
import { cookies } from 'next/headers'

const isValidUrl = (urlString: string) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const { email, password, fullName, client_redirect_uri } = await request.json();

  const supabase = createSupabaseServerClient(cookieStore);
  const supabaseAdmin = createSupabaseServerClient(cookieStore, { isAdmin: true });

  if (!email || !password || !fullName) {
    return createErrorResponse('Semua field wajib diisi.', 400, 'BAD_REQUEST');
  }
  if (password.length < 8) {
    return createErrorResponse('Password harus memiliki minimal 8 karakter.', 400, 'PASSWORD_TOO_SHORT');
  }

  let finalRedirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/login?status=registered`;
  if (client_redirect_uri && isValidUrl(client_redirect_uri)) {
      finalRedirectTo = client_redirect_uri;
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/confirm?next=${encodeURIComponent(finalRedirectTo)}`,
    },
  });

  if (authError) {
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'USER_REGISTRATION_FAILURE',
      status: 'FAILURE',
      details: { email, error: authError.message },
      ip_address: request.headers.get('x-forwarded-for') ?? undefined,
    });
    return createErrorResponse(authError.message, authError.status || 500, 'SUPABASE_AUTH_ERROR');
  }

  if (authData.user) {
    await supabaseAdmin.from('audit_logs').insert({
      event_type: 'USER_REGISTRATION_SUCCESS',
      status: 'SUCCESS',
      user_id: authData.user.id,
      details: { email, message: 'Pengguna terdaftar, menunggu verifikasi email.' },
      ip_address: request.headers.get('x-forwarded-for') ?? undefined,
    })
    
    return NextResponse.json({ 
        message: 'Pendaftaran berhasil. Silakan periksa email Anda untuk verifikasi.' 
    }, { status: 201 });
  }

  return createErrorResponse('Terjadi kesalahan yang tidak diketahui.', 500, 'UNKNOWN_ERROR');
}
