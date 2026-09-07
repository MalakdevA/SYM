'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getAdminUser, setAdminUser as persistAdminUser, logoutAdmin, type AdminUser } from '@/lib/auth';
import { fetchApiCached } from '@/lib/api';
import { isOverdue } from '@/lib/utils';
import { canAccessPage, type AdminPageKey } from '@/lib/adminPermissions';

const SIDEBAR_KEY = 'sym_admin_sidebar_collapsed';
const NOTIFICATIONS_POLL_MS = 60000;

export interface AdminNotification {
  id: string;
  pageKey: AdminPageKey;
  labelKey: string;
  labelFallback: string;
  count: number;
  href: string;
}

interface AdminContextType {
  user: AdminUser | null;
  isLoading: boolean;
  /** True once any admin data-fetch this session has fallen back to mock data. Surfaced as a small banner, never hidden. */
  isOffline: boolean;
  setOffline: (value: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  login: (user: AdminUser) => void;
  logout: () => void;
  refreshUser: () => void;
  /** Real alert counts (pending orders, low-stock parts, new messages, pending tickets) — empty
   *  array on fetch failure, never fabricated. Pre-filtered to what the current role can access. */
  notifications: AdminNotification[];
  notificationsLoading: boolean;
  refreshNotifications: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const refreshUser = useCallback(() => {
    setUser(getAdminUser());
    setIsLoading(false);
  }, []);

  const fetchNotifications = useCallback(async (forUser: AdminUser | null) => {
    if (!forUser) {
      setNotifications([]);
      return;
    }
    setNotificationsLoading(true);
    try {
      // Short-TTL cache: a page mounting at the same moment this poll fires (or another admin
      // tab open at the same time) shares one in-flight request instead of duplicating it, while
      // still refetching fresh data every poll tick (TTL is well under NOTIFICATIONS_POLL_MS).
      const [ordersRes, partsRes, contactRes, serviceRes] = await Promise.all([
        fetchApiCached('/orders/index.php', 20000).catch(() => null),
        fetchApiCached('/spare-parts/index.php', 20000).catch(() => null),
        fetchApiCached('/contact/index.php', 20000).catch(() => null),
        fetchApiCached('/service/index.php', 20000).catch(() => null),
      ]);

      const items: AdminNotification[] = [];

      if (ordersRes?.success && Array.isArray(ordersRes.data)) {
        const count = ordersRes.data.filter((o: { status?: string }) => o.status === 'قيد المعالجة').length;
        if (count > 0) {
          items.push({ id: 'pendingOrders', pageKey: 'orders', labelKey: 'admin.notifications.pendingOrders', labelFallback: 'طلبات قيد المعالجة', count, href: '/admin/orders' });
        }
      }
      if (partsRes?.success && Array.isArray(partsRes.data)) {
        const count = partsRes.data.filter((p: { stock?: number }) => Number(p.stock) <= 5).length;
        if (count > 0) {
          items.push({ id: 'lowStockParts', pageKey: 'spareParts', labelKey: 'admin.notifications.lowStockParts', labelFallback: 'قطع غيار منخفضة المخزون', count, href: '/admin/spare-parts' });
        }
      }
      if (contactRes?.success && Array.isArray(contactRes.data)) {
        const messages = contactRes.data as { status?: string; created_at?: string }[];
        const newCount = messages.filter((m) => m.status === 'unread').length;
        if (newCount > 0) {
          items.push({ id: 'newMessages', pageKey: 'customers', labelKey: 'admin.notifications.newMessages', labelFallback: 'رسائل تواصل جديدة', count: newCount, href: '/admin/customers' });
        }
        const overdueCount = messages.filter((m) => m.status !== 'replied' && m.created_at && isOverdue(m.created_at)).length;
        if (overdueCount > 0) {
          items.push({ id: 'overdueMessages', pageKey: 'customers', labelKey: 'admin.notifications.overdueMessages', labelFallback: 'رسائل تواصل متأخرة بدون رد', count: overdueCount, href: '/admin/customers' });
        }
      }
      if (serviceRes?.success && Array.isArray(serviceRes.data)) {
        const count = serviceRes.data.filter((t: { status?: string }) => t.status === 'pending').length;
        if (count > 0) {
          items.push({ id: 'pendingTickets', pageKey: 'service', labelKey: 'admin.notifications.pendingTickets', labelFallback: 'تذاكر صيانة معلقة', count, href: '/admin/service' });
        }
      }

      setNotifications(items.filter((n) => canAccessPage(forUser.role, n.pageKey)));
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(() => {
    fetchNotifications(user);
  }, [fetchNotifications, user]);

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications(user);
    const interval = setInterval(() => fetchNotifications(user), NOTIFICATIONS_POLL_MS);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getAdminUser());
    setIsLoading(false);
    const saved = localStorage.getItem(SIDEBAR_KEY);
    if (saved === '1') setSidebarCollapsed(true);
  }, []);

  const login = useCallback((u: AdminUser) => {
    persistAdminUser(u);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    logoutAdmin();
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);

  // Memoized so a change to one field (e.g. the 60s notification poll updating `notifications`)
  // doesn't force every consumer of useAdmin() — including the sidebar/header, which only read
  // `user`/`sidebarCollapsed` — to re-render.
  const value = useMemo<AdminContextType>(
    () => ({
      user,
      isLoading,
      isOffline,
      setOffline: setIsOffline,
      sidebarCollapsed,
      toggleSidebar,
      mobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      login,
      logout,
      refreshUser,
      notifications,
      notificationsLoading,
      refreshNotifications,
    }),
    [
      user,
      isLoading,
      isOffline,
      sidebarCollapsed,
      toggleSidebar,
      mobileSidebarOpen,
      openMobileSidebar,
      closeMobileSidebar,
      login,
      logout,
      refreshUser,
      notifications,
      notificationsLoading,
      refreshNotifications,
    ]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
