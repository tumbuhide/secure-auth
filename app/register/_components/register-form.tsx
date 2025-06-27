'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/app/_components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/_components/ui/card';
import { Input } from '@/app/_components/ui/input';
import { Label } from '@/app/_components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/app/_components/ui/alert';

async function registerUserAction(prevState: any, formData: FormData) {
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
        return { success: false, error: { message: "Password dan konfirmasi password tidak cocok." } };
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const data = await response.json();
    if (!response.ok) {
        return { success: false, error: { message: data.error?.message || 'Terjadi kesalahan' } };
    }
    return { success: true, message: data.message, error: null };
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Mendaftar...' : 'Daftar'}
        </Button>
    )
}

export function RegisterForm() {
  const router = useRouter();
  const initialState = { success: false, error: null, message: null };
  const [state, formAction] = useActionState(registerUserAction, initialState);

  useEffect(() => {
    if (state.success) {
      setTimeout(() => {
        router.push('/login?status=registered');
      }, 3000);
    }
  }, [state.success, router]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Buat Akun Baru</CardTitle>
        <CardDescription>Mulai perjalanan otentikasi aman Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        {state.success ? (
           <Alert variant="default" className="border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-700">
             <AlertTitle>Pendaftaran Berhasil!</AlertTitle>
             <AlertDescription>
                {state.message} Anda akan diarahkan ke halaman login...
             </AlertDescription>
           </Alert>
        ) : (
        <form action={formAction} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input id="fullName" name="fullName" placeholder="John Doe" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="nama@contoh.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
          </div>
          
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error.message}</AlertDescription>
            </Alert>
          )}

          <SubmitButton />

          <p className="px-8 text-center text-sm text-muted-foreground">
            Dengan mendaftar, Anda setuju dengan{' '}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">Ketentuan Layanan</Link>
            {' dan '}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">Kebijakan Privasi</Link>.
          </p>
        </form>
        )}
      </CardContent>
      {!state.success && (
        <CardFooter className="flex-col items-center">
            <div className="text-sm">
            Sudah punya akun?{' '}
            <Link href="/login" className="underline">Login di sini</Link>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
