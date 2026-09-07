import { z } from 'zod';

// Product Form Schema (for CMS)
export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  sku: z.string().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  categoryId: z.string().uuid('Please select a category'),
  price: z.number().min(0, 'Price must be a positive number'),
  colors: z.array(z.string()).optional(),
  specifications: z.record(z.string(), z.any()).optional(),
  features: z.array(z.string()).optional(),
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'pre_order']).default('in_stock'),
  status: z.enum(['draft', 'published']).default('draft'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Category Form Schema
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  displayOrder: z.number().min(0).default(0),
  parentId: z.string().uuid().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
