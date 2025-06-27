'use client';

import { useState } from 'react';
import { updateClientDetailsAction } from './actions';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/app/_components/ui/card';
import { Label } from '@/app/_components/ui/label';
import { Input } from '@/app/_components/ui/input';
import { Textarea } from '@/app/_components/ui/textarea';
import { Button } from '@/app/_components/ui/button';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';

interface ClientDetailsFormProps {
  client: {
    client_id: string;
    client_name: string;
    redirect_uris: string[];
    logo_uri: string | null;
  };
}

export function ClientDetailsForm({ client }: ClientDetailsFormProps) {
  const initialState = { success: false, message: null };
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);

  async function formAction(formData: FormData) {
    setIsPending(true);
    const result = await updateClientDetailsAction(null, formData);
    setState(result);
    setIsPending(false);
  }

  return (
    <Card>
      <form action={formAction}>
        <input type="hidden" name="clientId" value={client.client_id} />
        <CardHeader>
          <CardTitle>Pengaturan Aplikasi</CardTitle>
          <CardDescription>
            Ubah detail konfigurasi dasar untuk aplikasi klien Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="client_name">Nama Aplikasi</Label>
            <Input
              id="client_name"
              name="client_name"
              defaultValue={client.client_name}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logo_uri">URL Logo</Label>
            <Input
              id="logo_uri"
              name="logo_uri"
              type="url"
              defaultValue={client.logo_uri || ''}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="redirect_uris">URI Pengalihan (Callback)</Label>
            <Textarea
              id="redirect_uris"
              name="redirect_uris"
              defaultValue={client.redirect_uris.join('\n')} // ✅ Perbaikan KUNCI
              required
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Satu URL per baris atau pisahkan dengan koma.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div>
            {state.message && (
              <Alert
                variant={state.success ? 'default' : 'destructive'}
                className="border-0 bg-transparent p-0"
              >
                <AlertDescription
                  className={state.success ? 'text-green-600' : 'text-destructive'}
                >
                  {state.message}
                </AlertDescription>
              </Alert>
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
