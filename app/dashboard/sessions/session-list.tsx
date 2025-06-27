'use client';

import { useTransition } from 'react';
import { revokeSessionAction } from './actions';
import { Card, CardContent } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Laptop, Smartphone, Globe, LogOut } from 'lucide-react';
import type { ParsedSession } from '@/lib/types'; // Menggunakan tipe terpusat

interface SessionListProps {
  sessions: ParsedSession[];
}

function RevokeButton({ sessionId }: { sessionId: number }) {
    const [isPending, startTransition] = useTransition();

    const handleRevoke = () => {
        if (!confirm('Apakah Anda yakin ingin mengakhiri sesi ini?')) return;
        
        startTransition(async () => {
            const result = await revokeSessionAction(sessionId);
            if (!result.success) {
                alert(`Gagal mencabut sesi: ${result.message}`);
            }
        });
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleRevoke} disabled={isPending}>
            <LogOut className="mr-2 h-4 w-4" />
            {isPending ? 'Mengakhiri...' : 'Akhiri Sesi'}
        </Button>
    )
}

function SessionIcon({ deviceType }: { deviceType: string | undefined}) {
    if (deviceType === 'mobile' || deviceType === 'tablet') {
        return <Smartphone className="h-10 w-10 text-muted-foreground" />;
    }
    return <Laptop className="h-10 w-10 text-muted-foreground" />;
}

export function SessionList({ sessions }: SessionListProps) {
  if (sessions.length <= 1 && sessions.every(s => s.is_current)) {
    return (
      <Card className="text-center p-12">
        <CardContent>
          <div className="mx-auto rounded-full border border-dashed p-4 bg-background w-fit mb-4">
            <Laptop className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">Hanya Sesi Ini</h3>
          <p className="text-muted-foreground">Tidak ada sesi aktif lain yang terdeteksi.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardContent className="divide-y p-0">
            {sessions.map((session) => (
            <div key={session.id} className="p-6 flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <SessionIcon deviceType={session.device.type} />
                    <div>
                        <p className="font-semibold">
                            {session.browser.name || 'Browser tidak dikenal'} on {session.os.name || 'OS tidak dikenal'}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Globe className="h-4 w-4" />
                            {session.ip_address || 'IP tidak diketahui'}
                        </p>
                    </div>
                </div>
                <div className="flex w-full md:w-auto items-center justify-between gap-4">
                     <div className="text-sm text-muted-foreground">
                        {session.is_current ? (
                            <span className="font-semibold text-primary">Sesi saat ini</span>
                        ) : (
                            <span>Terakhir aktif: {new Date(session.last_used_at).toLocaleString()}</span>
                        )}
                    </div>
                    {!session.is_current && <RevokeButton sessionId={session.id} />}
                </div>
            </div>
            ))}
        </CardContent>
    </Card>
  );
}
