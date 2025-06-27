import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ConsentCard } from './_components/consent-card';
import { Alert, AlertDescription, AlertTitle } from '@/app/_components/ui/alert';
import { Card, CardHeader } from '@/app/_components/ui/card';

// Wrapper untuk menampilkan pesan error dengan layout yang konsisten
function ConsentError({ title, message }: { title: string; message: string }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <Alert variant="destructive">
                        <AlertTitle>{title}</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                </CardHeader>
            </Card>
        </div>
    );
}

export default async function ConsentPage({ searchParams }: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  // Jika tidak ada user, redirect ke login, sambil membawa semua parameter OAuth2
  if (!user) {
    const params = new URLSearchParams(searchParams as Record<string, string>).toString();
    return redirect(`/login?${params}`);
  }

  const clientId = searchParams.client_id as string;
  const redirectUri = searchParams.redirect_uri as string;
  const requestedScope = searchParams.scope as string;

  if (!clientId || !redirectUri || !requestedScope) {
    return <ConsentError title="Permintaan Tidak Lengkap" message="Parameter client_id, redirect_uri, dan scope wajib ada." />;
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('client_name, logo_uri, client_uri, redirect_uris, scope')
    .eq('client_id', clientId)
    .single();

  if (clientError || !client) {
    return <ConsentError title="Klien Tidak Valid" message="Aplikasi klien yang diminta tidak terdaftar atau tidak aktif." />;
  }

  if (!client.redirect_uris.includes(redirectUri)) {
    return <ConsentError title="Redirect URI Tidak Valid" message="URL callback yang diberikan tidak diizinkan untuk klien ini." />;
  }

  const requestedScopesArray = requestedScope.split(' ');
  const allowedScopesArray = client.scope.split(' ');
  const invalidScopes = requestedScopesArray.filter(s => !allowedScopesArray.includes(s));

  if (invalidScopes.length > 0) {
      return <ConsentError title="Scope Tidak Valid" message={`Aplikasi meminta izin yang tidak diizinkan: ${invalidScopes.join(', ')}`} />;
  }
  
  // Jika semua valid, tampilkan halaman persetujuan
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
        <ConsentCard 
            userEmail={user.email!}
            clientInfo={client}
            requestedScopes={requestedScopesArray}
        />
    </div>
  );
}
