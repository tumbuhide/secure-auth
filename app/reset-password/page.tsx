import { Suspense } from 'react';
import { ResetPasswordForm } from './_components/reset-password-form';

function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
            {children}
        </div>
    );
}

// Gunakan Suspense untuk memastikan setiap client component turunan (seperti useSearchParams di komponen lama) bekerja dengan baik.
// Meskipun komponen baru tidak lagi menggunakan useSearchParams, ini adalah praktik yang baik.
export default function ResetPasswordPage() {
    return (
        <AuthLayout>
            <Suspense fallback={<div>Memuat...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </AuthLayout>
    );
}
