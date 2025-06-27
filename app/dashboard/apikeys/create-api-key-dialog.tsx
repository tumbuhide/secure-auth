'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { createApiKeyAction } from './actions';
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
            {pending ? 'Membuat...' : 'Buat API Key'}
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
    );
}

export function CreateApiKeyDialog() {
  const [state, formAction] = useFormState(createApiKeyAction, initialState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Jangan tutup dialog jika ada error atau sukses, agar user bisa melihat hasilnya
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
        <Button>Buat API Key Baru</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!state.success ? (
          <>
            <DialogHeader>
              <DialogTitle>Buat API Key Baru</DialogTitle>
              <DialogDescription>
                Kunci ini digunakan untuk otentikasi server-to-server.
              </DialogDescription>
            </DialogHeader>
            <form action={formAction} ref={formRef} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input id="description" name="description" placeholder="Contoh: Kunci untuk layanan X" required />
                {state.error?.fieldErrors?.description && (
                    <p className="text-xs text-destructive">{state.error.fieldErrors.description.join(', ')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="scopes">Scope Izin (Opsional)</Label>
                <Input
                  id="scopes"
                  name="scopes"
                  placeholder="read:data write:data"
                />
                <p className="text-xs text-muted-foreground">
                    Pisahkan dengan spasi. Biarkan kosong untuk default.
                </p>
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
              <DialogTitle>API Key Dibuat!</DialogTitle>
              <DialogDescription>
                Salin dan simpan API Key ini di tempat yang aman. Anda tidak akan bisa melihatnya lagi.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex items-center gap-2">
                        <Input readOnly value={state.data?.key} className="font-mono" />
                        <CopyButton textToCopy={state.data?.key || ''} />
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
