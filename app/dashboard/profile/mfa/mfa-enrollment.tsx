'use client';

import { useState, useTransition } from 'react';
import { enrollMfaAction, verifyMfaAction } from './actions';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/_components/ui/input-otp';
import { Alert, AlertDescription, AlertTitle } from '@/app/_components/ui/alert';

interface EnrollmentData {
    factorId: string;
    otpauthUri: string;
}

export function MfaEnrollment() {
    const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isEnrolling, startEnrollTransition] = useTransition();
    const [isVerifying, startVerifyTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleStartEnrollment = () => {
        startEnrollTransition(async () => {
            setError(null);
            const result = await enrollMfaAction();
            if (result.success && result.data) {
                setEnrollmentData(result.data);
            } else {
                setError(result.error || 'Gagal memulai proses pendaftaran.');
            }
        });
    };

    const handleVerifyAndEnable = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!enrollmentData) return;

        startVerifyTransition(async () => {
            setError(null);
            const result = await verifyMfaAction(enrollmentData.factorId, verificationCode);
            if (!result.success) {
                setError(result.error || 'Gagal memverifikasi kode.');
            }
            // Sukses akan ditangani oleh revalidatePath dan parent component akan re-render
        });
    };
    
    if (!enrollmentData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Amankan Akun Anda</CardTitle>
                    <CardDescription>
                        Tambahkan lapisan keamanan ekstra. Setiap kali Anda login, Anda akan diminta password dan kode dari aplikasi otentikasi Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                         <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button onClick={handleStartEnrollment} disabled={isEnrolling}>
                        {isEnrolling ? 'Memuat...' : 'Aktifkan Otentikasi 2-Langkah'}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                 <CardTitle>Konfigurasi Otentikasi 2-Langkah</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold">Langkah 1: Pindai QR Code</h3>
                    <p className="text-sm text-muted-foreground">
                        Gunakan aplikasi otentikasi (Google Authenticator, Authy, dll) untuk memindai gambar ini.
                    </p>
                    <div className="mt-4 p-4 bg-white inline-block rounded-lg border">
                        <QRCode value={enrollmentData.otpauthUri} size={200} />
                    </div>
                </div>

                <form onSubmit={handleVerifyAndEnable} className="space-y-4">
                     <div>
                        <h3 className="font-semibold">Langkah 2: Verifikasi Kode</h3>
                        <p className="text-sm text-muted-foreground">
                            Masukkan kode 6 digit dari aplikasi Anda untuk menyelesaikan.
                        </p>
                    </div>
                    <div className="flex justify-center md:justify-start">
                        <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                     </div>
                     {error && (
                         <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button type="submit" disabled={isVerifying || verificationCode.length !== 6}>
                        {isVerifying ? 'Memverifikasi...' : 'Verifikasi & Aktifkan'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
