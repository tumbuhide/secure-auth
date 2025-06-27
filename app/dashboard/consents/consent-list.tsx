'use client';

import { useTransition } from 'react';
import { revokeConsentAction } from './actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar';
import { Badge } from '@/app/_components/ui/badge';
import { ShieldCheck, Trash } from 'lucide-react';

export type Consent = {
  client_id: string;
  scopes_granted: string[];
  granted_at: string;
  clients: {
      client_name: string;
      logo_uri: string | null;
  } | null;
};

interface ConsentListProps {
  consents: Consent[];
}

function RevokeButton({ clientId, clientName }: { clientId: string, clientName: string }) {
    const [isPending, startTransition] = useTransition();

    const handleRevoke = () => {
        if (!confirm(`Apakah Anda yakin ingin mencabut izin untuk aplikasi "${clientName}"? Anda mungkin perlu memberikan izin lagi saat login berikutnya.`)) return;
        
        startTransition(async () => {
            const result = await revokeConsentAction(clientId);
            if (!result.success) {
                alert(`Gagal mencabut izin: ${result.message}`);
            }
        });
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleRevoke} disabled={isPending} className="text-destructive hover:text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            {isPending ? 'Mencabut...' : 'Cabut Izin'}
        </Button>
    )
}

export function ConsentList({ consents }: ConsentListProps) {
  if (consents.length === 0) {
    return (
      <Card className="text-center p-12">
        <CardHeader>
          <div className="mx-auto rounded-full border border-dashed p-4 bg-background w-fit">
            <ShieldCheck className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle>Tidak Ada Persetujuan Aktif</CardTitle>
          <CardDescription>
            Anda belum memberikan izin ke aplikasi pihak ketiga mana pun.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="divide-y p-0">
        {consents.map((consent) => {
          const clientName = consent.clients?.client_name || 'Aplikasi Tidak Dikenal';
          return (
            <div key={consent.client_id} className="p-6 flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={consent.clients?.logo_uri || undefined} alt={`${clientName} logo`} />
                        <AvatarFallback>
                            <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{clientName}</p>
                        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-1 mt-1">
                            <span>Izin diberikan:</span>
                            {consent.scopes_granted.map(scope => (
                                <Badge key={scope} variant="secondary">{scope}</Badge>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex w-full md:w-auto items-center justify-between gap-4">
                     <div className="text-sm text-muted-foreground">
                        Diberikan pada: {new Date(consent.granted_at).toLocaleDateString()}
                    </div>
                    <RevokeButton clientId={consent.client_id} clientName={clientName} />
                </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  );
}
