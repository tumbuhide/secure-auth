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
  CardFooter
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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const cookieStore = await cookies();
  const supabase = createSupabaseServerClient(cookieStore, { isAdmin: true });

  const currentPage = Number(searchParams?.page) || 1;

  const { data: listUsersData, error: usersError } = await supabase.auth.admin.listUsers({
    page: currentPage,
    perPage: ITEMS_PER_PAGE,
  });
  
  const { users } = listUsersData || { users: [] };
  
  const { count, error: countError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (usersError || countError) {
    console.error({ usersError, countError });
    return <div>Error memuat data pengguna.</div>;
  }
  
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
          <p className="text-muted-foreground">
            Daftar semua pengguna yang terdaftar di sistem.
          </p>
        </div>
        <Button disabled>Tambah Pengguna</Button>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Terakhir Login</TableHead>
                <TableHead><span className="sr-only">Aksi</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                        {(user.app_metadata?.roles || ['user']).join(', ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.email_confirmed_at ? 'default' : 'outline'}>
                      {user.email_confirmed_at ? 'Terverifikasi' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm" disabled>
                      <Link href="#">Kelola</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
            <div className="text-xs text-muted-foreground">
                Menampilkan <strong>{users.length}</strong> dari <strong>{count}</strong> pengguna.
            </div>
            {totalPages > 1 && (
                <Pagination className="ml-auto">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href={currentPage > 1 ? `/admin/users?page=${currentPage - 1}` : '#'} />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink href={`/admin/users?page=${i + 1}`} isActive={currentPage === i + 1}>
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext href={currentPage < totalPages ? `/admin/users?page=${currentPage + 1}` : '#'} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
