import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UAParser } from 'ua-parser-js';
import { hashString } from '@/lib/utils';
import { SessionList } from './session-list';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';
import type { ParsedSession } from '@/lib/types'; // Menggunakan tipe terpusat

export default async function SessionsPage() {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/login');
  }
  
  const currentSessionToken = cookieStore.get('supabase-auth-token')?.value;
  const currentRefreshToken = currentSessionToken ? JSON.parse(currentSessionToken).refresh_token : null;
  const currentRefreshTokenHash = currentRefreshToken ? hashString(currentRefreshToken) : null;
  
  const { data: sessions, error } = await supabase
    .from('refresh_tokens')
    .select('id, ip_address, user_agent, last_used_at, token_hash')
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .order('last_used_at', { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    return (
        <div className="p-6">
            <Alert variant="destructive">
                <AlertDescription>Gagal memuat daftar sesi. Silakan periksa kebijakan RLS Anda.</AlertDescription>
            </Alert>
        </div>
    )
  }

  const parsedSessions: ParsedSession[] = sessions.map(session => {
    const result = new UAParser(session.user_agent || '').getResult();
    return {
        id: session.id,
        ip_address: session.ip_address,
        last_used_at: session.last_used_at,
        is_current: session.token_hash === currentRefreshTokenHash,
        device: result.device,
        os: result.os,
        browser: result.browser,
    };
  });

  parsedSessions.sort((a, b) => (a.is_current === b.is_current) ? 0 : a.is_current ? -1 : 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sesi Aktif</h1>
        <p className="text-muted-foreground">
          Kelola sesi login Anda di berbagai perangkat dan lokasi.
        </p>
      </div>
      
      <SessionList sessions={parsedSessions || []} />
    </div>
  );
}
