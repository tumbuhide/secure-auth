'use client';

import { useTransition } from 'react';
import { unenrollMfaAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Smartphone, Trash } from 'lucide-react';

export type MfaFactor = {
  id: string;
  friendly_name: string | null;
  created_at: string;
};

interface MfaFactorListProps {
  factors: MfaFactor[];
}

function UnenrollButton({ factorId }: { factorId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleUnenroll = () => {
        if (!confirm('Apakah Anda yakin ingin menonaktifkan MFA? Anda akan kehilangan lapisan keamanan tambahan ini.')) return;
        
        startTransition(async () => {
            const result = await unenrollMfaAction(factorId);
            if (!result.success) {
                alert(`Gagal menonaktifkan MFA: ${result.error}`);
            }
        });
    }

    return (
        <Button variant="destructive" size="sm" onClick={handleUnenroll} disabled={isPending}>
            <Trash className="mr-2 h-4 w-4" />
            {isPending ? 'Menonaktifkan...' : 'Nonaktifkan'}
        </Button>
    )
}

export function MfaFactorList({ factors }: MfaFactorListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Perangkat Terdaftar</CardTitle>
        <CardDescription>
          Berikut adalah perangkat atau aplikasi yang telah Anda daftarkan untuk Otentikasi 2-Langkah.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {factors.map((factor) => (
            <div key={factor.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                    <Smartphone className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <p className="font-semibold">{factor.friendly_name || 'Aplikasi Otentikator'}</p>
                        <p className="text-sm text-muted-foreground">
                            Terdaftar pada: {new Date(factor.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <UnenrollButton factorId={factor.id} />
            </div>
        ))}
      </CardContent>
    </Card>
  );
}
