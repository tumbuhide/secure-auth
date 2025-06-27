import { PropsWithChildren } from 'react';
import Link from 'next/link';
import { Menu, Shield } from 'lucide-react';

import { Button } from '@/app/_components/ui/button';
import {
  Sheet, // Akan saya buat setelah ini
  SheetContent,
  SheetTrigger,
} from '@/app/_components/ui/sheet';
import { SidebarNav } from './_components/sidebar-nav';
import { UserNav } from './_components/user-nav';

function Sidebar() {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Secure Auth';
    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Shield className="h-6 w-6" />
                    <span className="">{appName}</span>
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <SidebarNav />
                </nav>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: PropsWithChildren) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <Sidebar />
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col">
                           <Sidebar />
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        {/* Bisa ditambahkan Breadcrumbs atau search bar di sini */}
                    </div>
                    <UserNav />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
