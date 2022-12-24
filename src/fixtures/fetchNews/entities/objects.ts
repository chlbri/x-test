import { z } from 'zod';
import { categorySchema } from './strings';

export const articleSchema = z.object({
  author: z.string().nullish(),
  category: categorySchema,
  country: z.string(),
  description: z.string().optional(),
  image: z.string().nullish(),
  language: z.string(),
  published_at: z.string(),
  source: z.string(),
  title: z.string(),
  url: z.string(),
});

const paginationSchema = z.object({
  count: z.number(),
  limit: z.number(),
  offset: z.number(),
  total: z.number({
    description: 'Total number of news',
    invalid_type_error: 'Total is NaN',
  }),
});

export const newsResponseSchema = z.object({
  pagination: paginationSchema,
  news: z.array(articleSchema),
});

export type NewsResponse = z.infer<typeof newsResponseSchema>;
export type Article = z.infer<typeof articleSchema>;
