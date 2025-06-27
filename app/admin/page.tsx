import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Users, Box, ShieldAlert, BookText } from 'lucide-react';

// Komponen StatCard yang disederhanakan untuk admin
function AdminStatCard({ 
  icon: Icon, 
  title, 
  value,
  description
}: { 
  icon: React.ElementType, 
  title: string, 
  value: string,
  description: string,
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const cookieStore = cookies();
  // Gunakan klien dengan hak akses admin untuk mengambil data agregat
  const supabase = createSupabaseServerClient(cookieStore, { isAdmin: true });

  // Ambil total pengguna
  const { count: userCount, error: userError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
    
  // Ambil total aplikasi klien
  const { count: clientCount, error: clientError } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });

  // Ambil total log audit
  const { count: auditLogCount, error: auditLogError } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true });

  // Ambil pengaturan sistem (contoh: masa berlaku token)
  const { data: settingsData, error: settingsError } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'token_lifetimes')
    .single();

  if(userError || clientError || auditLogError || settingsError) {
      console.error({userError, clientError, auditLogError, settingsError});
  }

  const accessTokenLifetime = settingsData?.value?.access_token || 'N/A';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Selamat datang di pusat kendali Secure Auth.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard 
            icon={Users}
            title="Total Pengguna"
            value={userCount?.toLocaleString() || '0'}
            description="Jumlah semua pengguna terdaftar."
        />
         <AdminStatCard 
            icon={Box}
            title="Total Aplikasi Klien"
            value={clientCount?.toLocaleString() || '0'}
            description="Jumlah semua aplikasi terintegrasi."
        />
         <AdminStatCard 
            icon={BookText}
            title="Total Log Audit"
            value={auditLogCount?.toLocaleString() || '0'}
            description="Jumlah semua kejadian tercatat."
        />
        <AdminStatCard 
            icon={ShieldAlert}
            title="Masa Berlaku Access Token"
            value={`${accessTokenLifetime}s`}
            description="Durasi token akses sebelum kedaluwarsa."
        />
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Tautan Cepat</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Link href="/admin/users" className="block p-4 bg-muted hover:bg-muted/80 rounded-lg">
                <h3 className="font-semibold">Kelola Pengguna</h3>
                <p className="text-sm text-muted-foreground">Lihat dan kelola semua akun.</p>
            </Link>
             <Link href="/admin/clients" className="block p-4 bg-muted hover:bg-muted/80 rounded-lg">
                <h3 className="font-semibold">Kelola Aplikasi</h3>
                <p className="text-sm text-muted-foreground">Lihat semua aplikasi klien.</p>
            </Link>
             <Link href="/admin/audit-logs" className="block p-4 bg-muted hover:bg-muted/80 rounded-lg">
                <h3 className="font-semibold">Lihat Log Audit</h3>
                <p className="text-sm text-muted-foreground">Lacak semua aktivitas sistem.</p>
            </Link>
             <Link href="/admin/settings" className="block p-4 bg-muted hover:bg-muted/80 rounded-lg">
                <h3 className="font-semibold">Pengaturan Sistem</h3>
                <p className="text-sm text-muted-foreground">Konfigurasi perilaku server.</p>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
