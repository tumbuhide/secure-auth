import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ApiKeyList } from './api-key-list';
import { CreateApiKeyDialog } from './create-api-key-dialog';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';

export default async function ApiKeysPage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: apiKeys, error } = await supabase
    .from('api_keys')
    .select('id, prefix, description, scopes, last_used_at, created_at')
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching API keys:", error);
    return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertDescription>Gagal memuat daftar API Keys. Silakan periksa kebijakan RLS Anda.</AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Kelola kunci API untuk otentikasi M2M atau akses terprogram.
          </p>
        </div>
        <CreateApiKeyDialog />
      </div>
      
      <ApiKeyList apiKeys={apiKeys || []} />
    </div>
  );
}
