'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { changePasswordAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/app/_components/ui/card';
import { Label } from '@/app/_components/ui/label';
import { Input } from '@/app/_components/ui/input';
import { Button } from '@/app/_components/ui/button';

export function ChangePasswordForm() {
  const [state, setState] = useState<{ success: boolean; message: string | null }>({ success: false, message: null });
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function formAction(formData: FormData) {
    startTransition(async () => {
        const result = await changePasswordAction(null, formData);
        setState({
            success: result.success,
            message: result.message ?? null,
        });
    });
  }

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <Card>
      <form action={formAction} ref={formRef}>
        <CardHeader>
            <CardTitle>Ganti Password</CardTitle>
            <CardDescription>
            Untuk keamanan, sesi Anda di perangkat lain akan diakhiri setelah mengubah password.
            </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
            <div className="grid gap-2">
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <Input id="currentPassword" name="currentPassword" type="password" required disabled={isPending}/>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input id="newPassword" name="newPassword" type="password" required minLength={8} disabled={isPending}/>
            </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
            <div>
                {state?.message && (
                    <p className={`text-sm ${state.success ? 'text-green-600' : 'text-destructive'}`}>
                        {state.message}
                    </p>
                )}
            </div>
             <Button type="submit" disabled={isPending}>
                {isPending ? 'Mengubah...' : 'Ubah Password'}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
