'use client';

import { useTransition } from 'react';
import { revokeApiKeyAction } from './actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/_components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { KeyRound, Trash } from 'lucide-react';
import { Badge } from '@/app/_components/ui/badge';

type ApiKey = {
  id: number;
  prefix: string;
  description: string | null;
  scopes: string[];
  last_used_at: string | null;
  created_at: string;
};

interface ApiKeyListProps {
  apiKeys: ApiKey[];
}

function RevokeButton({ apiKeyId }: { apiKeyId: number }) {
    const [isPending, startTransition] = useTransition();

    const handleRevoke = () => {
        if (!confirm('Apakah Anda yakin ingin mencabut API key ini? Tindakan ini tidak dapat dibatalkan.')) return;
        
        startTransition(async () => {
            const result = await revokeApiKeyAction(apiKeyId);
            if (!result.success) {
                alert(`Gagal mencabut kunci: ${result.message}`);
            }
            // Revalidation akan mengurus pembaruan UI
        });
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleRevoke} disabled={isPending}>
            <Trash className="mr-2 h-4 w-4" />
            {isPending ? 'Mencabut...' : 'Cabut'}
        </Button>
    )
}

export function ApiKeyList({ apiKeys }: ApiKeyListProps) {
  if (apiKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-12 text-center">
        <div className="mb-4 rounded-full border border-dashed p-4">
            <KeyRound className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Belum ada API Key</h3>
        <p className="text-muted-foreground">
            Buat API key pertama Anda untuk otentikasi terprogram.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Berikut adalah daftar kunci API yang telah Anda buat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Prefix</TableHead>
              <TableHead>Terakhir Digunakan</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead><span className="sr-only">Aksi</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.description || '-'}</TableCell>
                <TableCell><code className="text-sm">{key.prefix}</code></TableCell>
                <TableCell>
                  {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Belum pernah'}
                </TableCell>
                <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                    <RevokeButton apiKeyId={key.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
