import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/app/_components/ui/button';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';
import { MfaEnrollment } from './mfa-enrollment';
import { MfaFactorList, MfaFactor } from './mfa-factor-list';

export default async function MfaPage() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  // Ambil semua faktor yang sudah terverifikasi
  const { data: factors, error } = await supabase
    .from('mfa_factors')
    .select('id, friendly_name, created_at')
    .eq('user_id', user.id)
    .eq('status', 'verified')
    .order('created_at');
    
  if (error) {
      console.error("Error fetching MFA factors:", error);
      return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Error</h1>
            <Alert variant="destructive">
                <AlertDescription>Gagal memuat status MFA. Silakan coba lagi nanti.</AlertDescription>
            </Alert>
        </div>
      );
  }

  const isMfaEnabled = factors && factors.length > 0;

  return (
    <div className="space-y-6">
        <div>
            <Button asChild variant="ghost" className="-ml-4">
                <Link href="/dashboard/profile" className="text-sm inline-flex items-center gap-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Profil
                </Link>
            </Button>
            <h1 className="text-3xl font-bold">Otentikasi Multi-Faktor (MFA)</h1>
             <p className="text-muted-foreground">
                {isMfaEnabled 
                    ? "Kelola perangkat yang terdaftar untuk lapisan keamanan tambahan."
                    : "Tambahkan lapisan keamanan ekstra pada akun Anda."
                }
            </p>
        </div>
        
        {isMfaEnabled ? (
            <MfaFactorList factors={factors as MfaFactor[]} />
        ) : (
            <MfaEnrollment />
        )}
    </div>
  );
}
