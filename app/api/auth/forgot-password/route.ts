import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createErrorResponse } from '@/lib/utils'

export async function POST(request: Request) {
  const { email } = await request.json()
  const supabase = createSupabaseServerClient()

  if (!email) {
    return createErrorResponse('Email wajib diisi.', 400, 'BAD_REQUEST', { missing: 'email' });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  const ip_address = request.headers.get('x-forwarded-for') ?? undefined;

  if (error) {
    // Jangan ekspos error ke klien, tetapi log untuk audit
    await supabase.from('audit_logs').insert({
      event_type: 'PASSWORD_RESET_FAILURE',
      status: 'FAILURE',
      details: { email, error: error.message },
      ip_address
    })
  } else {
    await supabase.from('audit_logs').insert({
        event_type: 'PASSWORD_RESET_SUCCESS',
        status: 'SUCCESS',
        details: { email },
        ip_address
      })
  }

  // Selalu kembalikan respons sukses untuk mencegah enumerasi email
  return NextResponse.json({ message: 'Jika akun dengan email tersebut ada, kami telah mengirimkan instruksi untuk reset password.' })
}
