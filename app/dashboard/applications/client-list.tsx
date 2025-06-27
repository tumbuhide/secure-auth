'use client';

import Link from 'next/link';
import { Badge } from '@/app/_components/ui/badge'; // Akan saya buat setelah ini
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
import { FilePlus2 } from 'lucide-react';

type Client = {
  id: number;
  client_id: string;
  client_name: string;
  is_active: boolean;
  created_at: string;
};

interface ClientListProps {
  clients: Client[];
}

export function ClientList({ clients }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-12 text-center">
        <div className="mb-4 rounded-full border border-dashed p-4">
            <FilePlus2 className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Belum ada aplikasi</h3>
        <p className="text-muted-foreground">
            Mulai dengan mendaftarkan aplikasi klien pertama Anda.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aplikasi Terdaftar</CardTitle>
        <CardDescription>
          Berikut adalah daftar semua aplikasi yang telah Anda daftarkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Aplikasi</TableHead>
              <TableHead>Client ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Dibuat</TableHead>
              <TableHead><span className="sr-only">Aksi</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.client_name}</TableCell>
                <TableCell><code className="text-sm">{client.client_id}</code></TableCell>
                <TableCell>
                  <Badge variant={client.is_active ? 'default' : 'destructive'}>
                    {client.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/applications/${client.client_id}`}>
                            Kelola
                        </Link>
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
