'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PRODUCTS } from '@/lib/data/products';

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  image: string;
  item_type?: 'scooter' | 'spare_part';
  // Extra detail fields — carried through to WhatsApp order message
  meta?: {
    capacity?: string;       // e.g. "300cc" — scooters/bikes
    internalCode?: string;   // spare parts
    externalCode?: string;   // spare parts
    model?: string;          // spare parts compatible model
  };
}


interface CartContextType {
  items: CartItem[];
  subtotal: number;
  count: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  sessionId: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SESSION_KEY = 'sym_egypt_cart_session_v1';
const LOCAL_CART_KEY = 'sym_egypt_local_cart_v1';

// Spare parts are capped per person to prevent bulk resale buying; scooters/bikes are not.
const MAX_SPARE_PART_QTY = 2;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  const syncPrices = React.useCallback((rawItems: CartItem[]): CartItem[] => {
    return rawItems.map((item) => {
      const pid = (item.product_id || '').toLowerCase().trim();
      const pname = (item.product_name || '').toLowerCase().trim();
      const found = PRODUCTS.find((p) => {
        const id = p.id.toLowerCase();
        const slug = p.slug.toLowerCase();
        const name = p.name.toLowerCase();
        return (
          id === pid ||
          slug === pid ||
          name === pname ||
          (pid.length > 3 && (pid.includes(slug) || slug.includes(pid) || pid.includes(id) || id.includes(pid))) ||
          (pname.length > 3 && (name.includes(pname) || pname.includes(name)))
        );
      });
      const finalPrice = found && found.price ? found.price : item.price;
      const inferredType: 'scooter' | 'spare_part' = item.item_type || (finalPrice < 40000 ? 'spare_part' : 'scooter');
      
      if (found && found.price) {
        return {
          ...item,
          price: found.price,
          product_name: found.name,
          image: item.image || found.image,
          item_type: inferredType,
        };
      }
      return {
        ...item,
        item_type: inferredType,
      };
    });
  }, []);

  useEffect(() => {
    let sId = localStorage.getItem(SESSION_KEY);
    if (!sId) {
      sId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem(SESSION_KEY, sId);
    }
    // Intentional: syncing React state with browser storage, which isn't available during
    // server/build rendering — this effect is the only place it's safe to read localStorage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionId(sId);

    try {
      const savedLocal = localStorage.getItem(LOCAL_CART_KEY);
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal);
        if (Array.isArray(parsed)) {
          setItems(syncPrices(parsed));
        }
      }
    } catch {
      // Ignore
    }
  }, [syncPrices]);

  const saveLocal = React.useCallback((newItems: CartItem[]) => {
    const synced = syncPrices(newItems);
    setItems(synced);
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(synced));
    } catch {
      // Ignore
    }
  }, [syncPrices]);

  const fetchCartFromApi = React.useCallback(async (sId: string) => {
    try {
      const res = await fetch(`/api/cart/index.php?session_id=${encodeURIComponent(sId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.items)) {
          const apiItems: CartItem[] = data.data.items.map((i: { id: string; product_id: string; product_name: string; price: number; quantity: number; image: string; item_type?: string }) => {
            const priceNum = Number(i.price) || 0;
            return {
              id: i.id,
              product_id: i.product_id,
              product_name: i.product_name,
              price: priceNum,
              quantity: Number(i.quantity) || 1,
              image: i.image || '/Husky ADV.png',
              item_type: (i.item_type as 'scooter' | 'spare_part') || (priceNum < 40000 ? 'spare_part' : 'scooter'),
            };
          });
          saveLocal(apiItems);
        }
      }
    } catch {
      // Offline fallback
    }
  }, [saveLocal]);

  // 1. Sync from PHP Backend API on mount
  useEffect(() => {
    if (!sessionId) return;
    const timer = setTimeout(() => {
      fetchCartFromApi(sessionId);
    }, 0);
    return () => clearTimeout(timer);
  }, [sessionId, fetchCartFromApi]);

  const addItem = async (item: Omit<CartItem, 'id'>) => {
    const pid = (item.product_id || '').toLowerCase().trim();
    const pname = (item.product_name || '').toLowerCase().trim();
    const matched = PRODUCTS.find((p) => {
      const id = p.id.toLowerCase();
      const slug = p.slug.toLowerCase();
      const name = p.name.toLowerCase();
      return (
        id === pid ||
        slug === pid ||
        name === pname ||
        (pid.length > 3 && (pid.includes(slug) || slug.includes(pid) || pid.includes(id) || id.includes(pid))) ||
        (pname.length > 3 && (name.includes(pname) || pname.includes(name)))
      );
    });

    const itemToSave = {
      ...item,
      price: matched?.price || item.price,
      product_name: matched?.name || item.product_name,
    };

    const existingIndex = items.findIndex((i) => i.product_id === itemToSave.product_id || i.product_name === itemToSave.product_name);
    const isSparePart = (itemToSave.item_type || (itemToSave.price < 40000 ? 'spare_part' : 'scooter')) === 'spare_part';
    let updated: CartItem[];

    if (existingIndex > -1) {
      updated = items.map((i, idx) => {
        if (idx !== existingIndex) return i;
        const nextQty = i.quantity + itemToSave.quantity;
        return { ...i, price: itemToSave.price, quantity: isSparePart ? Math.min(nextQty, MAX_SPARE_PART_QTY) : nextQty };
      });
    } else {
      const newItem: CartItem = {
        ...itemToSave,
        quantity: isSparePart ? Math.min(itemToSave.quantity, MAX_SPARE_PART_QTY) : itemToSave.quantity,
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      };
      updated = [newItem, ...items];
    }

    saveLocal(updated);
    setIsOpen(true); // Automatically open cart drawer on item addition

    // Sync with API
    if (sessionId) {
      try {
        await fetch('/api/cart/index.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            item_type: item.item_type || 'scooter',
            image: item.image,
          }),
        });
      } catch {
        // Ignore API failure
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    const updated = items.map((i) => {
      if (i.product_id !== productId) return i;
      const isSparePart = (i.item_type || (i.price < 40000 ? 'spare_part' : 'scooter')) === 'spare_part';
      return { ...i, quantity: isSparePart ? Math.min(quantity, MAX_SPARE_PART_QTY) : quantity };
    });
    saveLocal(updated);

    if (sessionId) {
      try {
        await fetch('/api/cart/index.php', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            product_id: productId,
            quantity,
          }),
        });
      } catch {
        // Ignore
      }
    }
  };

  const removeItem = async (productId: string) => {
    const updated = items.filter((i) => i.product_id !== productId);
    saveLocal(updated);

    if (sessionId) {
      try {
        await fetch(`/api/cart/index.php?session_id=${encodeURIComponent(sessionId)}&product_id=${encodeURIComponent(productId)}`, {
          method: 'DELETE',
        });
      } catch {
        // Ignore
      }
    }
  };

  const clearCart = async () => {
    saveLocal([]);
    if (sessionId) {
      try {
        await fetch(`/api/cart/index.php?session_id=${encodeURIComponent(sessionId)}`, {
          method: 'DELETE',
        });
      } catch {
        // Ignore
      }
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        count,
        isOpen,
        setIsOpen,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        sessionId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
