export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category_id?: string;
  status?: string;
  stock_status?: string;
  images?: { main?: string };
  specifications?: Record<string, unknown>;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order?: number;
}

export interface ProductWithCategory extends Product {
  categories: Category | null;
}

export interface SearchFilters {
  query: string;
  category?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  specifications?: {
    minSpeed?: number;
    minRange?: number;
    batteryType?: string[];
  };
  inStockOnly: boolean;
}

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  category: string;
  capacity?: string;
  specifications?: {
    battery?: string;
    speed?: string;
    range?: string;
    capacity?: string;
  };
  inStock: boolean;
  onCompareAdd?: (productId: string) => void;
}
