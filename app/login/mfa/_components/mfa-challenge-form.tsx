'use client';

import { useState, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/app/_components/ui/input-otp';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';

export function MfaChallengeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [otp, setOtp] = useState('');

  const userId = searchParams.get('user_id');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!userId) {
      setError('Sesi tidak valid. Silakan coba login kembali.');
      return;
    }
    
    if (otp.length !== 6) {
        setError('Kode verifikasi harus 6 digit.');
        return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/mfa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, verification_code: otp }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error?.message || 'Gagal memverifikasi kode.');
        }

        const params = new URLSearchParams(searchParams.toString());
        params.delete('user_id'); // Hapus user_id dari params

        const isOAuthFlow = params.has('client_id') && params.has('redirect_uri');
        const targetPath = isOAuthFlow
          ? `/api/oauth2/authorize?${params.toString()}`
          : '/dashboard';

        router.replace(targetPath);
      } catch (e: any) {
        setError(e.message);
      }
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Verifikasi Login Anda</CardTitle>
        <CardDescription>
          Untuk keamanan, masukkan kode 6 digit dari aplikasi otentikasi Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-center">
                {error}
                <br />
                <Link
                  href="/login"
                  className="font-semibold underline underline-offset-2"
                >
                  Coba login kembali
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isPending || otp.length !== 6}>
            {isPending ? 'Memverifikasi...' : 'Lanjutkan'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
