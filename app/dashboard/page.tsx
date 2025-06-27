import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';
import {
  Box,
  KeyRound,
  Laptop2,
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';

function StatCard({
  icon: Icon,
  title,
  description,
  link,
  linkText
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string;
  linkText: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{description}</div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={link}>
            {linkText} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default async function DashboardHomePage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const [clientRes, sessionRes, consentRes] = await Promise.all([
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('created_by_user_id', user.id),
    supabase
      .from('refresh_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('revoked_at', null),
    supabase
      .from('authorizations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
  ]);

  const clientError = clientRes.error;
  const sessionError = sessionRes.error;
  const consentError = consentRes.error;

  // Perbaikan: Hanya log dan tampilkan error jika benar-benar ada
  if (clientError || sessionError || consentError) {
    console.error('Dashboard error:', {
      clientError,
      sessionError,
      consentError
    });

    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Gagal memuat statistik dashboard. Silakan periksa koneksi atau kebijakan RLS Anda.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const clientCount = clientRes.count || 0;
  const sessionCount = sessionRes.count || 0;
  const consentCount = consentRes.count || 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">
          Selamat Datang, {user.user_metadata?.full_name || user.email}!
        </h1>
        <p className="text-muted-foreground">
          Ini adalah pusat kendali untuk semua aktivitas otentikasi Anda.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Box}
          title="Aplikasi Klien"
          description={`${clientCount} Aplikasi`}
          link="/dashboard/applications"
          linkText="Kelola Aplikasi"
        />
        <StatCard
          icon={Laptop2}
          title="Sesi Aktif"
          description={`${sessionCount} Sesi`}
          link="/dashboard/sessions"
          linkText="Kelola Sesi"
        />
        <StatCard
          icon={ShieldCheck}
          title="Persetujuan"
          description={`${consentCount} Izin Diberikan`}
          link="/dashboard/consents"
          linkText="Kelola Izin"
        />
      </div>

      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>
            Beberapa hal yang mungkin ingin Anda lakukan.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Button asChild variant="secondary">
            <Link href="/dashboard/profile">
              <User className="mr-2 h-4 w-4" /> Perbarui Profil Anda
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/dashboard/apikeys">
              <KeyRound className="mr-2 h-4 w-4" /> Kelola API Keys
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
