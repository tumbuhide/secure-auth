'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { createClientAction } from './actions';
import { Clipboard, Check } from 'lucide-react';

import { Button } from '@/app/_components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/app/_components/ui/dialog';
import { Input } from '@/app/_components/ui/input';
import { Label } from '@/app/_components/ui/label';
import { Textarea } from '@/app/_components/ui/textarea'; // Akan saya buat setelah ini
import { Alert, AlertDescription } from '@/app/_components/ui/alert';

const initialState = {
  success: false,
  data: null,
  error: null,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Mendaftarkan...' : 'Daftarkan Aplikasi'}
        </Button>
    );
}

function CopyButton({ textToCopy }: { textToCopy: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button variant="outline" size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
        </Button>
    )
}

export function CreateClientDialog() {
  const [state, formAction] = useFormState(createClientAction, initialState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      // Jangan tutup dialog, biarkan user lihat kredensial
    } else if (state.error) {
      // Ada error, jangan tutup dialog
    }
  }, [state]);

  const onDialogClose = () => {
    formRef.current?.reset();
    state.success = false;
    state.error = null;
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onDialogClose}>
      <DialogTrigger asChild>
        <Button>Daftarkan Aplikasi Baru</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!state.success ? (
          <>
            <DialogHeader>
              <DialogTitle>Daftarkan Aplikasi Baru</DialogTitle>
              <DialogDescription>
                Isi detail aplikasi klien Anda. Kredensial akan diberikan setelah pendaftaran.
              </DialogDescription>
            </DialogHeader>
            <form action={formAction} ref={formRef} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Nama Aplikasi</Label>
                <Input id="client_name" name="client_name" placeholder="Aplikasi Web Keren" required />
                {state.error?.fieldErrors?.client_name && (
                    <p className="text-xs text-destructive">{state.error.fieldErrors.client_name.join(', ')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirect_uris">URI Pengalihan (Callback)</Label>
                <Textarea
                  id="redirect_uris"
                  name="redirect_uris"
                  placeholder="https://app.com/callback, http://localhost:3000/callback"
                  required
                />
                <p className="text-xs text-muted-foreground">
                    URL callback yang diizinkan. Pisahkan dengan koma atau baris baru.
                </p>
                 {state.error?.fieldErrors?.redirect_uris && (
                    <p className="text-xs text-destructive">{state.error.fieldErrors.redirect_uris.join(', ')}</p>
                )}
              </div>
               {state.error && !state.error.fieldErrors &&(
                    <Alert variant="destructive">
                        <AlertDescription>{state.error.message}</AlertDescription>
                    </Alert>
                )}
              <DialogFooter>
                <SubmitButton />
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Pendaftaran Berhasil!</DialogTitle>
              <DialogDescription>
                Simpan Client Secret Anda di tempat yang aman. Anda tidak akan bisa melihatnya lagi.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Client ID</Label>
                    <div className="flex items-center gap-2">
                        <Input readOnly value={state.data?.client_id} className="font-mono" />
                        <CopyButton textToCopy={state.data?.client_id || ''} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Client Secret</Label>
                    <div className="flex items-center gap-2">
                        <Input readOnly value={state.data?.client_secret} className="font-mono" />
                        <CopyButton textToCopy={state.data?.client_secret || ''} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button">Selesai</Button>
                </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
