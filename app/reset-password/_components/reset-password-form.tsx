'use client';

import { useState, useTransition, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Input } from '@/app/_components/ui/input';
import { Label } from '@/app/_components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/app/_components/ui/alert';

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSessionReady, setSessionReady] = useState(false);

  // Inisialisasi Supabase client di dalam komponen
  const [supabase] = useState(() => createSupabaseBrowserClient());

  useEffect(() => {
    const handleSessionFromFragment = async (hash: string) => {
        const params = new URLSearchParams(hash.substring(1)); // remove #
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (type !== 'recovery' || !accessToken || !refreshToken) {
            // Jika bukan token recovery, jangan lakukan apa-apa
            // atau tampilkan error jika URL-nya aneh
            if (type && type !== 'recovery') {
                setError("Tipe pemulihan tidak valid.");
            }
            return;
        }

        const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        if (error) {
            setError("Sesi reset password tidak valid atau telah kedaluwarsa. Silakan coba lagi dari email Anda.");
            setSessionReady(false);
        } else {
            setSessionReady(true);
        }
    };
    
    // Panggil saat komponen dimuat pertama kali dengan hash yang ada
    handleSessionFromFragment(window.location.hash);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Event 'PASSWORD_RECOVERY' akan memuat sesi dari URL fragment
      if (event === 'PASSWORD_RECOVERY') {
        handleSessionFromFragment(window.location.hash);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSessionReady) {
        setError("Sesi tidak valid. Tidak dapat mengubah password.");
        return;
    }
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    startTransition(async () => {
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess('Password berhasil diubah! Anda akan diarahkan ke halaman login.');
            setTimeout(() => router.push('/login'), 3000);
        }
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>Masukkan password baru Anda di bawah ini.</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <Alert variant="default" className="border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-700">
             <AlertTitle>Berhasil!</AlertTitle>
             <AlertDescription>{success}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Password Baru</Label>
              <Input id="password" name="password" type="password" required minLength={8} disabled={isPending || !isSessionReady} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} disabled={isPending || !isSessionReady} />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isSessionReady && !error && (
                 <Alert variant="default">
                    <AlertDescription>Memvalidasi token reset password...</AlertDescription>
                 </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isPending || !isSessionReady}>
              {isPending ? 'Menyimpan...' : 'Simpan Password Baru'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
