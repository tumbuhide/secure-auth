'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/app/_components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Alert, AlertDescription } from '@/app/_components/ui/alert';

interface ClientInfo {
  client_name: string;
  logo_uri?: string | null;
  client_uri?: string | null;
}

interface ConsentCardProps {
  userEmail: string;
  clientInfo: ClientInfo;
  requestedScopes: string[];
}

const scopeDescriptions: Record<string, string> = {
  openid: 'Mengidentifikasi Anda.',
  profile: 'Melihat informasi profil dasar Anda (nama, gambar).',
  email: 'Melihat alamat email Anda.',
  phone: 'Melihat nomor telepon Anda.',
  address: 'Melihat alamat fisik Anda.',
};

const getScopeDescription = (scope: string) => 
  scopeDescriptions[scope] || 'Mengakses data khusus aplikasi.';

export function ConsentCard({ userEmail, clientInfo, requestedScopes }: ConsentCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const state = searchParams.get('state');
  const redirect_uri = searchParams.get('redirect_uri');

  const handleConsent = (approved: boolean) => {
    setError(null);
    startTransition(async () => {
      // Semua parameter query string saat ini
      const params = new URLSearchParams(searchParams.toString());
      
      // Menambahkan keputusan persetujuan
      params.set('consent', approved ? 'approved' : 'denied');
      
      try {
        const response = await fetch('/api/oauth2/consent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error?.message || 'Terjadi kesalahan saat memproses persetujuan.');
        }

        // Redirect ke URL yang dikembalikan oleh server
        router.push(result.redirect_to);

      } catch(e: any) {
        setError(e.message);
      }
    });
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center items-center">
        {clientInfo.logo_uri && (
          <Image
            src={clientInfo.logo_uri}
            alt={`${clientInfo.client_name} Logo`}
            width={64}
            height={64}
            className="mb-4 rounded-lg object-contain"
          />
        )}
        <CardTitle>Aplikasi Meminta Izin</CardTitle>
        <CardDescription>
          Login sebagai <span className="font-semibold">{userEmail}</span>. <br/>
          <span className="font-semibold">{clientInfo.client_name}</span> ingin mengakses akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="border-t border-b py-6">
        <p className="mb-4 text-sm font-medium text-center">
          Aplikasi ini akan diizinkan untuk:
        </p>
        <ul className="space-y-3">
          {requestedScopes.map((scope) => (
            <li key={scope} className="flex items-start">
              <CheckCircle2 className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
              <span className="text-muted-foreground">{getScopeDescription(scope)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Pastikan Anda mempercayai {clientInfo.client_name}. Anda dapat mencabut izin ini kapan saja dari dashboard Anda.
        </p>
      </CardContent>
      <CardFooter className="flex-col gap-4 pt-6">
        {error && (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div className="grid w-full grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => handleConsent(false)} disabled={isPending}>
            Tolak
          </Button>
          <Button onClick={() => handleConsent(true)} disabled={isPending}>
            {isPending ? 'Memproses...' : 'Izinkan'}
          </Button>
        </div>
        {clientInfo.client_uri && (
            <p className="text-center text-sm text-muted-foreground">
                <Link href={clientInfo.client_uri} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-primary">
                    Pelajari lebih lanjut tentang {clientInfo.client_name}
                </Link>
            </p>
        )}
      </CardFooter>
    </Card>
  );
}
