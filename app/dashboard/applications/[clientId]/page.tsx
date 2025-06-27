import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { ClientCredentialsCard } from './client-credentials-card';
import { ClientDetailsForm } from './client-details-form';
import { DangerZone } from './danger-zone';
import { Alert, AlertDescription, AlertTitle } from '@/app/_components/ui/alert';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';

export default async function ApplicationDetailPage({ params }: { params: { clientId: string } }) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const clientId = params.clientId;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('client_id', clientId)
    .eq('created_by_user_id', user.id)
    .single();
  
  if (error || !client) {
    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Error</h1>
            <Alert variant="destructive">
                <AlertTitle>Gagal Memuat Aplikasi</AlertTitle>
                <AlertDescription>
                    Aplikasi tidak ditemukan atau Anda tidak memiliki izin untuk melihatnya.
                </AlertDescription>
            </Alert>
            <Button asChild variant="ghost" className="-ml-4">
                <Link href="/dashboard/applications">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Daftar Aplikasi
                </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <div>
            <Button asChild variant="ghost" className="-ml-4">
                <Link href="/dashboard/applications" className="text-sm inline-flex items-center gap-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Daftar Aplikasi
                </Link>
            </Button>
            <div className="flex items-center gap-4 mt-2">
                <h1 className="text-3xl font-bold">{client.client_name}</h1>
                <Badge variant={client.is_active ? 'default' : 'destructive'}>
                    {client.is_active ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
            </div>
            <p className="text-muted-foreground font-mono text-sm">{client.client_id}</p>
        </div>
        
        <ClientCredentialsCard clientId={client.client_id} />
        <ClientDetailsForm client={client} />
        <DangerZone clientId={client.client_id} clientName={client.client_name} />
    </div>
  );
}
