import { z } from 'zod';

// Blog Form Schema (for CMS)
export const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(5, 'Slug must be at least 5 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  excerpt: z.string().min(20, 'Excerpt must be at least 20 characters').optional(),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  tags: z.array(z.string()).optional(),
  publishedDate: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type BlogFormData = z.infer<typeof blogSchema>;
