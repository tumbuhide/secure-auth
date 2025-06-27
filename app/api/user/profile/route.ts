import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// PUT: Untuk mengubah password
export async function PUT(request: Request) {
  const supabase = createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: { message: 'Tidak terotentikasi.' } }, { status: 401 })
  }

  const { currentPassword, newPassword } = await request.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: { message: 'Password saat ini dan password baru diperlukan.' } }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: { message: 'Password baru harus memiliki minimal 8 karakter.' } }, { status: 400 })
  }

  // 1. Verifikasi password saat ini dengan mencoba login
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })

  if (signInError) {
    return NextResponse.json({ error: { message: 'Password saat ini salah.' } }, { status: 403 })
  }

  // 2. Jika verifikasi berhasil, update password
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

  if (updateError) {
     await supabase.from('audit_logs').insert({
        event_type: 'PASSWORD_CHANGE', status: 'FAILURE', user_id: user.id,
        details: { error: updateError.message },
      })
    return NextResponse.json({ error: { message: 'Gagal mengubah password: ' + updateError.message } }, { status: 500 })
  }
  
  // 3. Cabut semua sesi/refresh token yang ada untuk keamanan
  await supabase.auth.signOut({ scope: 'global' })

  await supabase.from('audit_logs').insert({
    event_type: 'PASSWORD_CHANGE', status: 'SUCCESS', user_id: user.id
  })

  return NextResponse.json({ message: 'Password berhasil diubah.' })
}


// DELETE: Untuk menghapus akun pengguna
export async function DELETE(request: Request) {
  const supabase = createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: { message: 'Tidak terotentikasi.' } }, { status: 401 })
  }

  // Supabase Auth Admin client diperlukan untuk menghapus pengguna
  // Kita perlu membuat client khusus dengan service_role_key
  const supabaseAdmin = createSupabaseServerClient()

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (deleteError) {
    await supabase.from('audit_logs').insert({
      event_type: 'ACCOUNT_DELETION', status: 'FAILURE', user_id: user.id,
      details: { error: deleteError.message },
    })
    return NextResponse.json({ error: { message: 'Gagal menghapus akun: ' + deleteError.message } }, { status: 500 })
  }
  
  await supabase.from('audit_logs').insert({
    event_type: 'ACCOUNT_DELETION', status: 'SUCCESS', user_id: user.id
  })

  return NextResponse.json({ message: 'Akun berhasil dihapus.' })
}
