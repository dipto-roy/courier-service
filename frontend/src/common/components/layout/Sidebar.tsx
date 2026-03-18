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
    href: '/dashboard/shipments',
    label: 'Shipments',
    icon: Package,
    roles: [UserRole.CUSTOMER, UserRole.MERCHANT, UserRole.ADMIN],
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
  // ❌ NOTE: /dashboard/users route does not exist - removed from sidebar
  // Uncomment when the route is created
  // { href: '/dashboard/users', label: 'Users', icon: Users, roles: [UserRole.ADMIN, UserRole.SUPPORT] },
  {
    href: '/dashboard/payments',
    label: 'Payments',
    icon: CreditCard,
    roles: [UserRole.CUSTOMER, UserRole.MERCHANT, UserRole.ADMIN],
  },
  {
    href: '/dashboard/notifications',
    label: 'Notifications',
    icon: Bell,
    roles: [UserRole.CUSTOMER, UserRole.MERCHANT, UserRole.RIDER, UserRole.ADMIN, UserRole.HUB_STAFF, UserRole.SUPPORT],
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart3,
    roles: [UserRole.MERCHANT, UserRole.ADMIN, UserRole.HUB_STAFF],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => {
    // If no specific roles defined, show to everyone
    if (!item.roles || item.roles.length === 0) {
      return true;
    }
    // Show item only if user's role is in the allowed roles
    return user?.role && item.roles.includes(user.role as UserRole);
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-200 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
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

          {/* Footer */}
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground">
              © 2025 Courier Service
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
