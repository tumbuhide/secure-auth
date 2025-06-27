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
  CardFooter,
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

const ITEMS_PER_PAGE = 20;

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore, { isAdmin: true });

  const currentPage = Number(searchParams?.page) || 1;
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: logs, error, count } = await supabase
    .from('audit_logs')
    .select('id, timestamp, event_type, user_id, ip_address, status', { count: 'exact' })
    .order('timestamp', { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching audit logs:", error);
    return <div>Error memuat log audit.</div>;
  }
  
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Log Audit Sistem</h1>
        <p className="text-muted-foreground">
          Lacak semua aktivitas dan kejadian penting yang terjadi di sistem.
        </p>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Tipe Event</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs && logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell><code className="text-sm">{log.event_type}</code></TableCell>
                  <TableCell><code className="text-xs">{log.user_id || 'N/A'}</code></TableCell>
                  <TableCell>{log.ip_address}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'SUCCESS' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
                Menampilkan <strong>{from + 1}-{Math.min(to + 1, count || 0)}</strong> dari <strong>{count}</strong> log
            </div>
             {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href={currentPage > 1 ? `/admin/audit-logs?page=${currentPage - 1}` : '#'} />
                        </PaginationItem>
                        {/* More complex pagination logic can be added here */}
                        <PaginationItem>
                            <PaginationLink href="#" isActive>
                                {currentPage}
                            </PaginationLink>
                        </PaginationItem>
                         <PaginationItem>
                            <PaginationNext href={currentPage < totalPages ? `/admin/audit-logs?page=${currentPage + 1}` : '#'} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
