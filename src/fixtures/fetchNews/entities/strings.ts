import { enum as zenum, output } from 'zod';

export const categorySchema = zenum([
  'general',
  'business',
  'entertainment',
  'health',
  'science',
  'sports',
  'technology',
]);

export const CATEGORIES = categorySchema._def.values;
export type Category = output<typeof categorySchema>;
