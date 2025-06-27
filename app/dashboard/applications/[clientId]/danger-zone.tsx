'use client';

import { useTransition } from 'react';
import { deleteClientAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Trash } from 'lucide-react';

interface DangerZoneProps {
    clientId: string;
    clientName: string;
}

export function DangerZone({ clientId, clientName }: DangerZoneProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm(`Apakah Anda yakin ingin menghapus aplikasi "${clientName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        
        startTransition(async () => {
            await deleteClientAction(clientId);
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
                <div className="flex items-center justify-between rounded-lg border border-destructive bg-background p-4">
                    <div>
                        <h4 className="font-semibold">Hapus Aplikasi Ini</h4>
                        <p className="text-sm text-muted-foreground">Menghapus aplikasi bersifat permanen.</p>
                    </div>
                    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
                        <Trash className="mr-2 h-4 w-4" />
                        {isPending ? 'Menghapus...' : 'Hapus Aplikasi'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
