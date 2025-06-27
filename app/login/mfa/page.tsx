import { Suspense } from 'react';
import { MfaChallengeForm } from './_components/mfa-challenge-form';

function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
            {children}
        </div>
    );
}

export default function MfaChallengePage() {
    return (
        <AuthLayout>
            <Suspense fallback={<div>Memuat...</div>}>
                <MfaChallengeForm />
            </Suspense>
        </AuthLayout>
    );
}
