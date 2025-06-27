import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/app/_components/ui/card';
import { Badge } from '@/app/_components/ui/badge';

// Tipe ini harus mencakup semua data yang kita query di server
type Client = {
    client_id: string;
    client_name: string;
    redirect_uris: string[];
    grant_types: string[];
    response_types: string[];
    token_endpoint_auth_method: string;
    logo_uri: string | null;
    created_by_user_id: string;
    created_at: string;
    updated_at: string;
};

interface ClientDetailsCardProps {
    client: Client;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-sm">{value}</dd>
        </div>
    )
}

function ArrayDetailItem({ label, items }: { label: string; items: string[] }) {
    return (
         <div>
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-1 flex flex-wrap gap-1">
                {items.map(item => <Badge variant="secondary" key={item}>{item}</Badge>)}
            </dd>
        </div>
    )
}

export function ClientDetailsCard({ client }: ClientDetailsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Detail Konfigurasi</CardTitle>
                <CardDescription>
                    Informasi lengkap mengenai aplikasi klien ini.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <DetailItem label="Nama Aplikasi" value={client.client_name} />
                     <DetailItem label="Pembuat (User ID)" value={<code className="text-sm">{client.created_by_user_id}</code>} />
                    <DetailItem label="Metode Otentikasi Token" value={<Badge variant="outline">{client.token_endpoint_auth_method}</Badge>} />
                    <DetailItem label="URL Logo" value={client.logo_uri || 'Tidak ada'} />
                    <div className="sm:col-span-2">
                         <ArrayDetailItem label="Redirect URIs" items={client.redirect_uris} />
                    </div>
                    <ArrayDetailItem label="Grant Types" items={client.grant_types} />
                    <ArrayDetailItem label="Response Types" items={client.response_types} />
                    <DetailItem label="Dibuat Pada" value={new Date(client.created_at).toLocaleString()} />
                    <DetailItem label="Terakhir Diperbarui" value={new Date(client.updated_at).toLocaleString()} />
                </dl>
            </CardContent>
        </Card>
    );
}
