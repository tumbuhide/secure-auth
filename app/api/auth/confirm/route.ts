import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') // URL tujuan akhir

  // Jika tujuan tidak ada, default ke dashboard
  const redirectTo = next ? new URL(next) : new URL('/dashboard', origin);

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Verifikasi berhasil, sesi telah dibuat.
      // Tambahkan parameter untuk menandakan sukses, agar UI bisa menampilkan pesan selamat datang.
      redirectTo.searchParams.set('welcome', 'true');
      return NextResponse.redirect(redirectTo);
    }
  }

  // Jika gagal, arahkan ke halaman status dengan pesan error
  const errorUrl = new URL('/auth/status', origin);
  errorUrl.searchParams.set('error', 'true');
  errorUrl.searchParams.set('error_description', 'Link verifikasi tidak valid atau telah kedaluwarsa.');
  return NextResponse.redirect(errorUrl);
}
