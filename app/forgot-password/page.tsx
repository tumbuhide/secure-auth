import { ForgotPasswordForm } from './_components/forgot-password-form';

function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
            {children}
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <AuthLayout>
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
