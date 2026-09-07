/**
 * SYM Egypt Enterprise Platform - Admin Auth Helper
 * Manages admin authentication session, tokens, and protection
 */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  token: string;
}

const AUTH_KEY = 'sym_admin_auth_user_v2';

export function getAdminUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(AUTH_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export function setAdminUser(user: AdminUser) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `sym_admin_session=active; path=/; max-age=86400; SameSite=Lax${secureFlag}`;
  } catch (e) {
    console.error(e);
  }
}

export function logoutAdmin() {
  if (typeof window === 'undefined') return;
  try {
    const user = getAdminUser();
    if (user?.token) {
      // Best-effort server-side token revocation so a stolen token can't be replayed
      // after logout — failure here must never block the client-side logout below.
      fetch('/api/auth/logout.php', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(AUTH_KEY);
    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `sym_admin_session=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
    window.location.href = '/admin/login';
  } catch (e) {
    console.error(e);
  }
}

export function isAuthenticated(): boolean {
  return getAdminUser() !== null;
}
