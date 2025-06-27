import { PropsWithChildren } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from './_components/sidebar'

export default async function AdminLayout({ children }: PropsWithChildren) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Jika tidak ada user sama sekali, redirect ke halaman login
    return redirect('/login')
  }

  // Cek role pengguna. Ini adalah gerbang keamanan utama.
  // Pastikan Anda telah mengatur 'roles' di metadata pengguna di Supabase
  const roles = user.app_metadata?.roles || []
  if (!roles.includes('admin') && !roles.includes('superadmin')) {
    // Jika user bukan admin, redirect ke dashboard pengguna biasa
    return redirect('/dashboard')
  }

  // Jika user adalah admin, tampilkan layout admin
  return (
    <div>
        <AdminSidebar>
            <main className="py-10 lg:pl-72">
                <div className="px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </AdminSidebar>
    </div>
  )
}
