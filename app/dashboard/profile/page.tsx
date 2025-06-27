import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';
import { UpdateProfileForm } from './update-profile-form';
import { ChangePasswordForm } from './change-password-form';
import { MfaSettingsCard } from './mfa-settings-card';
import { DangerZone } from './danger-zone';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }

  const { data: mfaFactors, error: mfaError } = await supabase
    .from('mfa_factors')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'verified');
    
  if (mfaError) {
      console.error("Error fetching MFA status:", mfaError);
      return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertDescription>Gagal memuat status MFA. Silakan periksa kebijakan RLS Anda.</AlertDescription>
            </Alert>
        </div>
      );
  }

  const isMfaEnabled = (mfaFactors?.length || 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil & Keamanan</h1>
        <p className="text-muted-foreground">
          Kelola informasi profil, password, dan pengaturan keamanan akun Anda.
        </p>
      </div>
      
      <UpdateProfileForm 
        fullName={user.user_metadata?.full_name || ''} 
        email={user.email || ''}
      />
      <ChangePasswordForm />
      <MfaSettingsCard isMfaEnabled={isMfaEnabled} />
      <DangerZone />
    </div>
  );
}
