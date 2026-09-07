/**
 * SYM Egypt Enterprise Platform - API Bridge Client
 * Connects Next.js Frontend & Admin Panel to Native PHP REST API (12 Modules)
 * 
 * Enterprise Security Protections:
 * 1. Automatic Authorization Header (Bearer Token) Injection
 * 2. Strict Content-Type & Security Headers (X-Requested-With, Anti-CSRF)
 * 3. Safe JSON Response Parsing & HTML Error Interception (No SyntaxErrors)
 * 4. Input Sanitization & URI Encoding for Query Parameters
 * 5. Request Timeout via AbortController against hanging requests
 * 6. Automated Session Expiry Handling (401 Unauthorized Auto-Logout)
 */

import { getAdminUser, logoutAdmin } from './auth';

const API_BASE_URL = typeof window !== 'undefined' ? '/api' : 'http://localhost/sym-egypt-scooters/api';

/** Default Request Timeout in Milliseconds (15 seconds) */
const DEFAULT_TIMEOUT_MS = 15000;

function normalizeApiUrl(endpoint: string): string {
  let resolved = endpoint.startsWith('http') || endpoint.startsWith('/api/') ? endpoint : `${API_BASE_URL}${endpoint}`;
  if (!resolved.includes('.php')) {
    const [path, search] = resolved.split('?');
    const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
    resolved = `${cleanPath}/index.php${search ? `?${search}` : ''}`;
  }
  return resolved;
}

/**
 * Enhanced Fetch Wrapper with Authentication & Security Headers
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const user = getAdminUser();
  const headers = new Headers(options.headers || {});
  
  // 1. Inject Admin Bearer Token if Authenticated
  if (user && user.token) {
    headers.set('Authorization', `Bearer ${user.token}`);
  }

  // 2. Add Security & anti-CSRF headers
  if (!headers.has('X-Requested-With')) {
    headers.set('X-Requested-With', 'XMLHttpRequest');
  }

  // 3. Resolve Full API Endpoint
  const url = normalizeApiUrl(endpoint);

  // 4. Request Timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);

    // 5. Handle Session Expiry / Invalid Token
    if (response.status === 401) {
      logoutAdmin();
    }

    // 6. Safe Response JSON Monkey-Patching (Intersects HTML 404/500 errors smoothly)
    response.json = async () => {
      try {
        const text = await response.text();
        const contentType = response.headers.get('content-type') || '';

        // Verify if backend returned valid JSON
        if (contentType.includes('application/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
          return JSON.parse(text);
        }
        
        console.warn(`[fetchWithAuth] Backend returned non-JSON response (${response.status}) for ${url}`);
        return { 
          success: false, 
          data: [], 
          error: `Backend endpoint returned status ${response.status}` 
        };
      } catch {
        return { success: false, data: [], error: 'Failed to process backend response' };
      }
    };

    return response;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`[fetchWithAuth] Request timeout for ${url}`);
    }
    throw err;
  }
}

/**
 * Standard Unified API Client Function
 */
export async function fetchApi<T = unknown>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  try {
    const user = getAdminUser();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Inject Bearer Token if available
    if (user && user.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }

    const url = normalizeApiUrl(endpoint);

    // Request Timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);

    // Auto Logout on Unauthorized
    if (res.status === 401) {
      logoutAdmin();
      return { success: false, error: 'Unauthorized session' };
    }

    // Safe Response Parsing
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : { success: res.ok };
    } catch {
      console.warn(`[fetchApi] Non-JSON payload received from ${endpoint}`);
      return { 
        success: false, 
        error: `Server error (${res.status}). Non-JSON payload received.` 
      };
    }

    if (!res.ok && data && !data.error) {
      data.error = `HTTP error ${res.status}`;
    }

    return data;
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === 'AbortError';
    const errorMsg = isTimeout ? 'Request timed out' : (err instanceof Error ? err.message : 'Network request failed');
    console.warn(`[fetchApi] API call failed for ${endpoint}: ${errorMsg}`);
    return { success: false, error: errorMsg };
  }
}

/**
 * Deduplicated + short-lived cached GET wrapper around fetchApi.
 * Multiple components mounting at once (or fast client-side navigation
 * between pages) share a single in-flight request instead of each firing
 * their own network call, and reuse the result for `ttlMs` afterwards.
 */
const apiCache = new Map<string, { promise: Promise<{ success: boolean; data?: unknown; error?: string }>; timestamp: number }>();

export function fetchApiCached<T = unknown>(
  endpoint: string,
  ttlMs = 60000
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const now = Date.now();
  const cached = apiCache.get(endpoint);

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.promise as Promise<{ success: boolean; data?: T; error?: string }>;
  }

  const promise = fetchApi<T>(endpoint).then(async (res) => {
    // One quick retry against transient network blips (GET is safe to retry)
    if (!res.success) {
      await new Promise((r) => setTimeout(r, 600));
      res = await fetchApi<T>(endpoint);
    }
    // Don't let a still-failing/offline response poison the cache for other callers
    if (!res.success) {
      apiCache.delete(endpoint);
    }
    return res;
  });

  apiCache.set(endpoint, { promise: promise as Promise<{ success: boolean; data?: unknown; error?: string }>, timestamp: now });
  return promise;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━ API MODULES ━━━━━━━━━━━━━━━━━━━━━━━━

// 1. Products API
export const getProductsApi = () => fetchApi('/products/index.php');
export const saveProductApi = (productData: unknown) => 
  fetchApi('/products/index.php', { method: 'POST', body: JSON.stringify(productData) });
export const deleteProductApi = (id: string) => 
  fetchApi('/products/index.php', { method: 'DELETE', body: JSON.stringify({ id: String(id).trim() }) });

// 2. Orders & Checkout API
export const getOrdersApi = () => fetchApi('/orders/index.php');
export const createOrderApi = (orderData: unknown) => 
  fetchApi('/orders/index.php', { method: 'POST', body: JSON.stringify(orderData) });
export const updateOrderStatusApi = (id: string, status: string) => 
  fetchApi('/orders/index.php', { method: 'PUT', body: JSON.stringify({ id: String(id).trim(), status: String(status).trim() }) });

export interface FawryCheckoutItemPayload {
  product_id: string;
  product_name: string;
  quantity: number;
  image?: string;
}

export interface FawryCheckoutPayload {
  session_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  city: string;
  address: string;
  payment_method: 'CARD' | 'PAYATFAWRY' | 'MWALLET';
  items: FawryCheckoutItemPayload[];
}

export interface FawryInitiateResult {
  order_id: string;
  order_no: string;
  merchant_ref_num: string;
  fawry_ref_number: string | null;
  redirect_url: string | null;
  amount: number;
  payment_method: string;
}

/**
 * Initiates a real Fawry payment: creates the order + payment_transactions
 * record server-side with backend-verified prices, and calls the live Fawry
 * Init API. Requires FAWRY_MERCHANT_CODE / FAWRY_SECURITY_KEY to be configured.
 */
export const initiateFawryPaymentApi = (payload: FawryCheckoutPayload) =>
  fetchApi<FawryInitiateResult>('/fawry/initiate/index.php', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export interface FawryVerifyResult {
  order_id: string;
  order_no: string;
  merchant_ref_num: string;
  fawry_ref_number: string | null;
  payment_status: string;
  fawry_status?: string;
  amount: number;
  payment_method: string;
  customer_name?: string;
  note?: string;
}

/** Checks the real payment status of a Fawry transaction against Fawry + local DB. */
export const verifyFawryPaymentApi = (merchantRefNum: string) =>
  fetchApi<FawryVerifyResult>(`/fawry/verify/index.php?merchantRefNum=${encodeURIComponent(merchantRefNum)}`);

// 3. Settings API
export const getSettingsApi = () => fetchApi('/settings/index.php');
export const updateSettingsApi = (settingsData: unknown) => 
  fetchApi('/settings/index.php', { method: 'POST', body: JSON.stringify(settingsData) });

// 4. Analytics API
export const getAnalyticsApi = () => fetchApi('/analytics/index.php');
export const logPageViewApi = (path: string, title: string) => 
  fetchApi('/analytics/index.php', { method: 'POST', body: JSON.stringify({ path: String(path), title: String(title) }) });

// 5. Showrooms API
export const getShowroomsApi = () => fetchApi('/showrooms/index.php');
export const saveShowroomApi = (showroomData: unknown) => 
  fetchApi('/showrooms/index.php', { method: 'POST', body: JSON.stringify(showroomData) });

// 6. Service Tickets API
export const getServiceTicketsApi = () => fetchApi('/service/index.php');
export const createServiceTicketApi = (ticketData: unknown) => 
  fetchApi('/service/index.php', { method: 'POST', body: JSON.stringify(ticketData) });

// 7. Spare Parts API
export const getSparePartsApi = () => fetchApi('/spare-parts/index.php');
export const saveSparePartApi = (partData: unknown) => 
  fetchApi('/spare-parts/index.php', { method: 'POST', body: JSON.stringify(partData) });

// 8. Customers API
export const getCustomersApi = () => fetchApi('/customers/index.php');

// 9. Test Ride API
export const submitTestRideApi = (data: unknown) => 
  fetchApi('/test-ride/index.php', { method: 'POST', body: JSON.stringify(data) });

// 10. Contact Messages API
export const sendContactMessageApi = (data: unknown) => 
  fetchApi('/contact/index.php', { method: 'POST', body: JSON.stringify(data) });

// 11. Image Physical Upload API
export async function uploadImageApi(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const user = getAdminUser();
    const headers: Record<string, string> = {
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }

    const res = await fetch(`${API_BASE_URL}/upload/index.php`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (res.status === 401) {
      logoutAdmin();
      return null;
    }

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (data.success && data.data?.url) {
        return data.data.url;
      }
    } catch {
      console.warn('[uploadImageApi] Non-JSON response received for image upload');
    }
  } catch (err) {
    console.error('[uploadImageApi] File upload failed', err);
  }
  return null;
}

// 12. Warranty Verification API with Strict Input Encoding
export const checkWarrantyApi = (chassisNo: string, phone: string) => {
  const cleanChassis = encodeURIComponent(String(chassisNo || '').trim());
  const cleanPhone = encodeURIComponent(String(phone || '').trim());
  return fetchApi(`/warranty/index.php?chassis_no=${cleanChassis}&phone=${cleanPhone}`);
};

export const registerWarrantyApi = (data: unknown) =>
  fetchApi('/warranty/index.php', { method: 'POST', body: JSON.stringify(data) });

export const updateWarrantyApi = (data: unknown) =>
  fetchApi('/warranty/index.php', { method: 'PUT', body: JSON.stringify(data) });