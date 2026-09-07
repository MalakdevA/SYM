import type { AdminRole } from '@/types/admin';

/**
 * Role-based page access for the admin dashboard.
 *
 * This is UI-level enforcement only — it hides nav links and blocks direct navigation for staff
 * using the dashboard as intended. It is NOT a backend security boundary: the real PHP endpoints
 * (`requireAdminAuth()`) only verify "is this a valid admin session token", not "does this admin's
 * role permit this specific action". A technically-savvy holder of a valid token could still call
 * any endpoint directly. Real API-level authorization would need role checks added to every PHP
 * endpoint — a separate, larger backend change, not covered here.
 */

export type AdminPageKey =
  | 'overview'
  | 'inventory'
  | 'spareParts'
  | 'orders'
  | 'customers'
  | 'service'
  | 'showrooms'
  | 'analytics'
  | 'users'
  | 'settings';

export const PAGE_ROUTES: Record<AdminPageKey, string> = {
  overview: '/admin',
  inventory: '/admin/inventory',
  spareParts: '/admin/spare-parts',
  orders: '/admin/orders',
  customers: '/admin/customers',
  service: '/admin/service',
  showrooms: '/admin/showrooms',
  analytics: '/admin/analytics',
  users: '/admin/users',
  settings: '/admin/settings',
};

const ALL_ROLES: AdminRole[] = ['Super Admin', 'Sales Manager', 'Content Editor', 'Support Staff', 'Finance Admin'];

// Overview is deliberately open to every role — it's the landing page after login and shows
// nothing role-sensitive beyond what each role can already see on its own permitted pages.
export const PAGE_PERMISSIONS: Record<AdminPageKey, AdminRole[]> = {
  overview: ALL_ROLES,
  inventory: ['Super Admin', 'Sales Manager', 'Content Editor'],
  spareParts: ['Super Admin', 'Support Staff', 'Finance Admin'],
  orders: ['Super Admin', 'Sales Manager', 'Finance Admin'],
  customers: ['Super Admin', 'Sales Manager', 'Support Staff', 'Finance Admin'],
  service: ['Super Admin', 'Support Staff'],
  showrooms: ['Super Admin', 'Sales Manager', 'Content Editor'],
  analytics: ['Super Admin', 'Sales Manager', 'Finance Admin'],
  // System administration stays Super-Admin-only — managing other admins' accounts and site-wide
  // settings/maintenance mode are inherently platform-owner-level actions.
  users: ['Super Admin'],
  settings: ['Super Admin'],
};

export function canAccessPage(role: string | undefined, page: AdminPageKey): boolean {
  if (!role) return false;
  const allowed = PAGE_PERMISSIONS[page] as string[];
  return allowed.includes(role);
}

/** Resolves the longest matching route for a pathname (so /admin/orders/123 still maps to 'orders'). */
export function pageKeyForPath(pathname: string): AdminPageKey | null {
  const entries = Object.entries(PAGE_ROUTES) as [AdminPageKey, string][];
  const sorted = entries.sort((a, b) => b[1].length - a[1].length);
  for (const [key, route] of sorted) {
    if (route === '/admin') {
      if (pathname === '/admin') return key;
      continue;
    }
    if (pathname === route || pathname.startsWith(`${route}/`)) return key;
  }
  return null;
}
