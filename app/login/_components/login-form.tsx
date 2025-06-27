'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAction } from './actions';

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
import { Alert, AlertDescription } from '@/app/_components/ui/alert';

const initialState = {
    success: false,
    error: undefined,
    data: null,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Logging in...' : 'Login'}
        </Button>
    )
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.success) {
      const params = new URLSearchParams(searchParams.toString());
      if (state.data?.mfa_required) {
        params.set('user_id', state.data.user_id!);
        router.replace(`/login/mfa?${params.toString()}`);
      } else {
        const redirectTo = params.get('client_id') 
          ? `/api/oauth2/authorize?${params.toString()}`
          : '/dashboard';
        router.replace(redirectTo);
      }
    }
  }, [state, router, searchParams]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Login</CardTitle>
        <CardDescription>Selamat datang kembali! Silakan masuk ke akun Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@contoh.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                >
                    Lupa Password?
                </Link>
            </div>
            <Input 
              id="password" 
              name="password"
              type="password" 
              required
            />
          </div>
          
          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <SubmitButton />
        </form>
      </CardContent>
      <CardFooter className="flex-col items-center">
        <div className="text-sm text-center">
          Belum punya akun?{' '}
          <Link href="/register" className="underline">
            Daftar di sini
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
