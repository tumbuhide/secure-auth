import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ClientList } from './client-list';
import { CreateClientDialog } from './create-client-dialog';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';

export default async function ApplicationsPage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, client_id, client_name, is_active, created_at')
    .eq('created_by_user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertDescription>Gagal memuat daftar aplikasi. Silakan periksa kebijakan RLS Anda.</AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Aplikasi Klien</h1>
          <p className="text-muted-foreground">
            Kelola aplikasi yang dapat menggunakan akun Anda untuk otentikasi.
          </p>
        </div>
        <CreateClientDialog />
      </div>
      
      <ClientList clients={clients || []} />
    </div>
  );
}
