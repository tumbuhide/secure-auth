import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/app/_components/ui/alert';
import { ClientDetailsCard } from './client-details-card';
import { AdminActionsCard } from './admin-actions-card';

export default async function AdminClientDetailPage({ params }: { params: { clientId: string } }) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore, { isAdmin: true });
  const clientId = params.clientId;

  const { data: client, error } = await supabase
    .from('clients')
    .select('*') // Ambil semua kolom untuk ditampilkan
    .eq('client_id', clientId)
    .single();
  
  if (error || !client) {
    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Error</h1>
            <Alert variant="destructive">
                <AlertTitle>Gagal Memuat Aplikasi</AlertTitle>
                <AlertDescription>
                    Aplikasi klien dengan ID ini tidak ditemukan.
                </AlertDescription>
            </Alert>
            <Button asChild variant="ghost" className="-ml-4">
                <Link href="/admin/clients">
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
                <Link href="/admin/clients" className="text-sm inline-flex items-center gap-2 text-muted-foreground">
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
        
        <AdminActionsCard 
            clientId={client.client_id}
            clientName={client.client_name}
            isActive={client.is_active}
        />
        <ClientDetailsCard client={client} />
    </div>
  );
}
