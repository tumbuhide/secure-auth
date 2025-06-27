import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';
import { SettingsForm } from './settings-form';

export default async function AdminSettingsPage() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore, { isAdmin: true });

  const { data: settings, error } = await supabase
    .from('system_settings')
    .select('key, value, description')
    .order('key');

  if (error) {
    console.error("Error fetching settings:", error);
    return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertDescription>Gagal memuat pengaturan sistem.</AlertDescription>
            </Alert>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Konfigurasi Sistem</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan global yang memengaruhi perilaku server otentikasi.
        </p>
      </div>
      
      <SettingsForm settings={settings || []} />
    </div>
  );
}
