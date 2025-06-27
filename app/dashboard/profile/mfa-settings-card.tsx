import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';
import { Shield, Smartphone } from 'lucide-react';

interface MfaSettingsCardProps {
    isMfaEnabled: boolean;
}

export function MfaSettingsCard({ isMfaEnabled }: MfaSettingsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Otentikasi Multi-Faktor (MFA)</CardTitle>
                <CardDescription>
                    Tambahkan lapisan keamanan ekstra pada akun Anda.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                    <div className="flex items-center gap-4">
                        <Smartphone className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <h4 className="font-semibold">Aplikasi Otentikator</h4>
                            <Badge variant={isMfaEnabled ? 'default' : 'secondary'} className="mt-1">
                                {isMfaEnabled ? 'Aktif' : 'Tidak Aktif'}
                            </Badge>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/profile/mfa">
                            Kelola
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
