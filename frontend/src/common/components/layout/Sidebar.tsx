'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/features/auth/stores';
import { UserRole } from '@/src/common/types';
import { cn } from '@/src/common/lib/utils';
import {
  LayoutDashboard,
  Package,
  Truck,
  Building2,
  CreditCard,
  Bell,
  BarChart3,
  Users,
  Shield,
  HeadphonesIcon,
  DollarSign,
  MapPin,
  ClipboardList,
  AlertTriangle,
  Settings,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/dashboard/admin',
    label: 'Admin',
    icon: Shield,
    roles: [UserRole.ADMIN],
  },
  {
    href: '/dashboard/finance',
    label: 'Finance',
    icon: DollarSign,
    roles: [UserRole.FINANCE, UserRole.ADMIN],
  },
  {
    href: '/dashboard/support',
    label: 'Support',
    icon: HeadphonesIcon,
    roles: [UserRole.SUPPORT, UserRole.ADMIN],
  },
  {
    href: '/dashboard/agent',
    label: 'Agent',
    icon: ClipboardList,
    roles: [UserRole.AGENT, UserRole.ADMIN],
  },
  {
    href: '/dashboard/shipments',
    label: 'Shipments',
    icon: Package,
    roles: [UserRole.CUSTOMER, UserRole.MERCHANT, UserRole.ADMIN, UserRole.AGENT],
  },
  {
    href: '/dashboard/pickups',
    label: 'Pickups',
    icon: MapPin,
    roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.MERCHANT],
  },
  {
    href: '/dashboard/rider',
    label: 'Rider',
    icon: Truck,
    roles: [UserRole.RIDER, UserRole.ADMIN],
  },
  {
    href: '/dashboard/hub',
    label: 'Hub',
    icon: Building2,
    roles: [UserRole.HUB_STAFF, UserRole.ADMIN],
  },
  {
    href: '/dashboard/users',
    label: 'Users',
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.SUPPORT],
  },
  {
    href: '/dashboard/payments',
    label: 'Payments',
    icon: CreditCard,
    roles: [UserRole.CUSTOMER, UserRole.MERCHANT, UserRole.ADMIN, UserRole.FINANCE],
  },
  {
    href: '/dashboard/notifications',
    label: 'Notifications',
    icon: Bell,
    roles: [
      UserRole.CUSTOMER,
      UserRole.MERCHANT,
      UserRole.RIDER,
      UserRole.ADMIN,
      UserRole.HUB_STAFF,
      UserRole.SUPPORT,
    ],
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart3,
    roles: [UserRole.MERCHANT, UserRole.ADMIN, UserRole.FINANCE, UserRole.HUB_STAFF],
  },
  {
    href: '/dashboard/audit',
    label: 'Audit Log',
    icon: ClipboardList,
    roles: [UserRole.ADMIN],
  },
  {
    href: '/dashboard/sla',
    label: 'SLA Monitor',
    icon: AlertTriangle,
    roles: [UserRole.ADMIN, UserRole.SUPPORT, UserRole.HUB_STAFF],
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return user?.role && item.roles.includes(user.role as UserRole);
  });

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-200 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {filteredNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}/`));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">© 2025 FastX Courier</p>
          </div>
        </div>
      </aside>
    </>
  );
}
