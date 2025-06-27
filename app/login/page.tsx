import { Suspense } from 'react';
import { LoginForm } from './_components/login-form';

function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
            {children}
        </div>
    );
}

export default function LoginPage() {
    return (
        <AuthLayout>
            <Suspense fallback={<div>Memuat...</div>}>
                <LoginForm />
            </Suspense>
        </AuthLayout>
    );
}
