'use client';

import { useTransition } from 'react';
import { toggleClientStatusAction, deleteClientAction } from './actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Trash, ToggleLeft, ToggleRight, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';
import { useState } from 'react';

interface AdminActionsCardProps {
    clientId: string;
    clientName: string;
    isActive: boolean;
}

export function AdminActionsCard({ clientId, clientName, isActive }: AdminActionsCardProps) {
    const [isTogglePending, startToggleTransition] = useTransition();
    const [isDeletePending, startDeleteTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleToggle = () => {
        const action = isActive ? 'menonaktifkan' : 'mengaktifkan';
        if (!confirm(`Apakah Anda yakin ingin ${action} aplikasi ini?`)) return;
        
        startToggleTransition(async () => {
            const result = await toggleClientStatusAction(clientId, isActive);
            if (!result.success) {
                setError(result.message || 'Gagal mengubah status.');
            } else {
                setError(null);
            }
        });
    }

    const handleDelete = () => {
        if (!confirm(`PERINGATAN: Apakah Anda benar-benar yakin ingin menghapus aplikasi "${clientName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
        
        startDeleteTransition(async () => {
            await deleteClientAction(clientId);
            // Redirect akan ditangani oleh server action
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tindakan Admin</CardTitle>
                <CardDescription>
                    Kelola status dan keberadaan aplikasi klien ini.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <h4 className="font-semibold">Status Aplikasi</h4>
                        <p className="text-sm text-muted-foreground">Aktifkan atau nonaktifkan aplikasi ini.</p>
                    </div>
                     <Button variant="outline" onClick={handleToggle} disabled={isTogglePending}>
                        {isActive ? <ToggleRight className="mr-2 h-4 w-4 text-green-500"/> : <ToggleLeft className="mr-2 h-4 w-4"/>}
                        {isTogglePending ? 'Memproses...' : (isActive ? 'Nonaktifkan' : 'Aktifkan')}
                    </Button>
                </div>
                 <div className="flex items-center justify-between rounded-lg border border-destructive p-4">
                    <div>
                        <h4 className="font-semibold text-destructive">Hapus Aplikasi</h4>
                        <p className="text-sm text-muted-foreground">Tindakan ini bersifat permanen.</p>
                    </div>
                     <Button variant="destructive" onClick={handleDelete} disabled={isDeletePending}>
                        <Trash className="mr-2 h-4 w-4"/>
                        {isDeletePending ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
