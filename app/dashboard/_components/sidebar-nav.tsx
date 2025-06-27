'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
    LayoutDashboard, 
    Box, 
    KeyRound, 
    Laptop2, 
    ShieldCheck,
    type LucideIcon 
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navigationItems: NavItem[] = [
  { name: 'Gambaran Umum', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Aplikasi Klien', href: '/dashboard/applications', icon: Box },
  { name: 'API Keys', href: '/dashboard/apikeys', icon: KeyRound },
  { name: 'Sesi Aktif', href: '/dashboard/sessions', icon: Laptop2 },
  { name: 'Persetujuan', href: '/dashboard/consents', icon: ShieldCheck },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col">
      <ul role="list" className="space-y-1">
        {navigationItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={cn(
                'group flex items-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                pathname === item.href
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  pathname === item.href
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground group-hover:text-accent-foreground'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
