'use client';

import { useState, useTransition } from 'react';
import { updateProfileAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/app/_components/ui/card';
import { Label } from '@/app/_components/ui/label';
import { Input } from '@/app/_components/ui/input';
import { Button } from '@/app/_components/ui/button';

interface UpdateProfileFormProps {
  fullName: string;
  email: string;
}

export function UpdateProfileForm({ fullName, email }: UpdateProfileFormProps) {
  const [state, setState] = useState<{ success: boolean; message: string | null }>({ success: false, message: null });
  const [isPending, startTransition] = useTransition();

  async function formAction(formData: FormData) {
    startTransition(async () => {
        const result = await updateProfileAction(null, formData);
        setState({
          success: result.success,
          message: result.message ?? null, // fallback undefined -> null
        });
        
    });
  }

  return (
    <Card>
        <form action={formAction}>
            <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>
                Perbarui nama lengkap Anda. Alamat email tidak dapat diubah.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input id="fullName" name="fullName" defaultValue={fullName} required disabled={isPending}/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Alamat Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={email} disabled />
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
                    {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
            </CardFooter>
      </form>
    </Card>
  );
}
