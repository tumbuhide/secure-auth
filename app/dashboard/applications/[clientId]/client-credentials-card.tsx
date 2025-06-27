'use client';

import { useState, useTransition } from 'react';
import { regenerateClientSecretAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/_components/ui/card';
import { Label } from '@/app/_components/ui/label';
import { Input } from '@/app/_components/ui/input';
import { Button } from '@/app/_components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/app/_components/ui/alert';
import { Clipboard, Check, KeyRound } from 'lucide-react';

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

interface ClientCredentialsCardProps {
    clientId: string;
}

export function ClientCredentialsCard({ clientId }: ClientCredentialsCardProps) {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ success: boolean; message: string; newSecret?: string } | null>(null);

    const handleRegenerate = () => {
        if (!confirm('Apakah Anda yakin? Rahasia lama akan segera tidak valid dan tidak dapat dipulihkan.')) return;
        
        startTransition(async () => {
            const actionResult = await regenerateClientSecretAction(clientId);
            setResult(actionResult);
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Kredensial Aplikasi</CardTitle>
                <CardDescription>
                    Kredensial ini digunakan untuk mengotentikasi aplikasi Anda dengan aman.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Client ID</Label>
                    <div className="flex items-center gap-2">
                        <Input readOnly value={clientId} className="font-mono" />
                        <CopyButton textToCopy={clientId} />
                    </div>
                </div>

                {result?.success && result.newSecret && (
                    <Alert>
                        <AlertTitle className="text-amber-600">Rahasia Klien Baru</AlertTitle>
                        <AlertDescription>
                            Simpan rahasia ini di tempat aman. Anda tidak akan bisa melihatnya lagi.
                            <div className="flex items-center gap-2 mt-2">
                                <Input readOnly value={result.newSecret} className="font-mono text-amber-700 bg-amber-50 border-amber-200" />
                                <CopyButton textToCopy={result.newSecret} />
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
                
                {result && !result.success && (
                    <Alert variant="destructive">
                        <AlertDescription>{result.message}</AlertDescription>
                    </Alert>
                )}
                
                <div className="rounded-lg border bg-muted p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h4 className="font-semibold">Buat Ulang Rahasia Klien</h4>
                            <p className="text-sm text-muted-foreground">Jika rahasia Anda bocor, buat ulang segera. Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                        <Button variant="outline" onClick={handleRegenerate} disabled={isPending}>
                           <KeyRound className="mr-2 h-4 w-4" />
                           {isPending ? 'Membuat...' : 'Buat Ulang'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
