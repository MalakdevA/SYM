'use client';

import { useEffect, useState } from 'react';
import { PRODUCTS, ProductItem } from './data/products';
import { fetchApi } from './api';

export type Product = ProductItem;
export { PRODUCTS as INITIAL_PRODUCTS };

const SYNC_TTL_MS = 60000; // avoid re-fetching on every fast page navigation
let syncPromise: Promise<ProductItem[]> | null = null;
let syncedAt = 0;

/**
 * Merges live database products (managed via the admin panel /api/products
 * endpoint) into the shared static PRODUCTS array IN PLACE. Every module that
 * imports PRODUCTS holds the same array reference, so once this runs, admin
 * price/stock/spec edits and newly added products become visible across the
 * whole client app without every listing component needing its own fetch.
 *
 * Deduplicated: many components call this independently on mount (listing
 * pages, the detail page, the global sync). They all share one in-flight
 * request and its cached result for SYNC_TTL_MS instead of each firing their
 * own network call.
 */
export function syncLiveProducts(): Promise<ProductItem[]> {
  const now = Date.now();
  if (syncPromise && now - syncedAt < SYNC_TTL_MS) {
    return syncPromise;
  }

  syncedAt = now;
  syncPromise = (async () => {
    try {
      const res = await fetchApi<ProductItem[]>('/products/index.php');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const byId = new Map<string, ProductItem>();
        for (const p of PRODUCTS) byId.set(p.id, p);
        for (const live of res.data) {
          const local = byId.get(live.id);
          if (!local) {
            byId.set(live.id, live);
            continue;
          }
          // Only let non-empty live fields override the bundled local data —
          // an incomplete DB row (blank image/capacity/etc.) must never blank
          // out a known-good local value.
          const patch: Partial<ProductItem> = {};
          for (const [key, value] of Object.entries(live)) {
            const isEmpty =
              value === null ||
              value === undefined ||
              value === '' ||
              (Array.isArray(value) && value.length === 0);
            if (!isEmpty) (patch as Record<string, unknown>)[key] = value;
          }
          byId.set(live.id, { ...local, ...patch });
        }

        const merged = Array.from(byId.values());
        PRODUCTS.length = 0;
        PRODUCTS.push(...merged);
      } else {
        // Nothing usable came back — don't hold onto a dead-end cache, retry sooner
        syncedAt = 0;
      }
    } catch {
      // Backend unreachable — keep serving the bundled static catalog, retry on next call
      syncedAt = 0;
    }
    return PRODUCTS;
  })();

  return syncPromise;
}

/** Reactive hook: returns the static catalog immediately, then live DB data once fetched. */
export function useLiveProducts(): ProductItem[] {
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS);

  useEffect(() => {
    let cancelled = false;
    syncLiveProducts().then((merged) => {
      if (!cancelled) setProducts([...merged]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return products;
}

/**
 * Resolves the freshest data for a single product by id/slug. Reuses the
 * same deduplicated/cached full-catalog sync as everything else (no extra
 * network round-trip), so a price/stock correction made in the admin panel
 * shows up immediately even though the detail page shell was pre-rendered
 * at build time.
 */
export async function fetchLiveProduct(idOrSlug: string): Promise<ProductItem | null> {
  const merged = await syncLiveProducts();
  return merged.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null;
}
