import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ConsentList, Consent } from './consent-list';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';

export default async function ConsentsPage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: consents, error } = await supabase
    .from('authorizations')
    .select(`
        client_id,
        scopes_granted,
        granted_at,
        clients (
            client_name,
            logo_uri
        )
    `)
    .eq('user_id', user.id)
    .order('granted_at', { ascending: false });

  if (error) {
    console.error("Error fetching consents:", error);
    return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertDescription>Gagal memuat daftar persetujuan. Silakan periksa kebijakan RLS Anda.</AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manajemen Persetujuan</h1>
        <p className="text-muted-foreground">
          Lihat dan kelola aplikasi pihak ketiga yang memiliki akses ke akun Anda.
        </p>
      </div>
      
      <ConsentList consents={consents as unknown as Consent[] || []} />
    </div>
  );
}
