'use client';

import { useState, useTransition } from 'react';
import { deleteAccountAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/_components/ui/card';
import { Label } from '@/app/_components/ui/label';
import { Input } from '@/app/_components/ui/input';
import { Button } from '@/app/_components/ui/button';
import { Trash } from 'lucide-react';

export function DangerZone() {
  // Menggunakan useState dan useTransition, BUKAN useActionState/useFormStatus
  const [state, setState] = useState<{ success: boolean; message: string | null }>({
    success: false,
    message: null,
  });
  const [isPending, startTransition] = useTransition();

  // Fungsi wrapper untuk memanggil Server Action
  async function formAction(formData: FormData) {
    startTransition(async () => {
      const result = await deleteAccountAction(null, formData);
      setState(result);
    });
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle>Zona Berbahaya</CardTitle>
        <CardDescription>
          Tindakan di area ini tidak dapat dibatalkan. Pastikan Anda benar-benar yakin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Untuk mengonfirmasi, ketik "<b>hapus akun saya</b>" di bawah ini:
            </Label>
            <Input
              id="confirmation"
              name="confirmation"
              type="text"
              required
              pattern="hapus akun saya"
              className="max-w-xs"
              disabled={isPending}
            />
          </div>
          {state.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}
          <Button type="submit" variant="destructive" disabled={isPending}>
            <Trash className="mr-2 h-4 w-4" />
            {isPending ? 'Menghapus...' : 'Saya mengerti, hapus akun saya'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
