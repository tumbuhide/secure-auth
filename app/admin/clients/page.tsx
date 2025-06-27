import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/app/_components/ui/pagination';
import { Badge } from '@/app/_components/ui/badge';
import { Button } from '@/app/_components/ui/button';
import Link from 'next/link';

const ITEMS_PER_PAGE = 10;

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore, { isAdmin: true });

  const currentPage = Number(searchParams?.page) || 1;
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: clients, error, count } = await supabase
    .from('clients')
    .select('client_id, client_name, is_active, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching clients:", error);
    return <div>Error memuat data aplikasi.</div>;
  }
  
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Aplikasi Klien (Global)</h1>
          <p className="text-muted-foreground">
            Daftar semua aplikasi klien yang terdaftar di seluruh sistem.
          </p>
        </div>
      </div>
      <Card>
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
              {clients && clients.map((client) => (
                <TableRow key={client.client_id}>
                  <TableCell className="font-medium">{client.client_name}</TableCell>
                  <TableCell><code className="text-sm">{client.client_id}</code></TableCell>
                  <TableCell>
                    <Badge variant={client.is_active ? 'default' : 'destructive'}>
                        {client.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(client.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/clients/${client.client_id}`}>Kelola</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious href={currentPage > 1 ? `/admin/clients?page=${currentPage - 1}` : '#'} />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                        <PaginationLink href={`/admin/clients?page=${i + 1}`} isActive={currentPage === i + 1}>
                            {i + 1}
                        </PaginationLink>
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext href={currentPage < totalPages ? `/admin/clients?page=${currentPage + 1}` : '#'} />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
