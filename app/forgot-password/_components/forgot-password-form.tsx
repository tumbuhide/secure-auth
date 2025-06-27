'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';

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

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Terjadi kesalahan.');
        }

        setSuccess('Jika akun dengan email tersebut ada, kami telah mengirimkan instruksi untuk reset password.');
      } catch (e: any) {
        setError(e.message);
      }
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Lupa Password</CardTitle>
        <CardDescription>Masukkan email Anda untuk menerima link reset password.</CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <Alert variant="default" className="border-green-500/50 text-green-700 dark:border-green-500 [&>svg]:text-green-700">
            <AlertTitle>Permintaan Terkirim</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@contoh.com"
                required
                disabled={isPending}
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Mengirim...' : 'Kirim Instruksi'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="link" asChild className="w-full">
            <Link href="/login">Kembali ke Login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
