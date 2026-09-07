'use client';

import { useEffect } from 'react';
import { syncLiveProducts } from '@/lib/products-store';

/**
 * Invisible client-side sync: merges live /api/products data into the shared
 * PRODUCTS catalog once per app load, so admin-managed edits and new products
 * are reflected across the site (see lib/products-store.ts for details).
 */
export function ProductsSync() {
  useEffect(() => {
    syncLiveProducts();
  }, []);

  return null;
}
