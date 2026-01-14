import { z } from 'zod';

export const searchArticlesSchema = z.object({
  query: z.string().describe('Search query to find articles'),
});

export const getArticleSchema = z.object({
  url: z.string().describe('Full URL of the article to retrieve'),
});

export type SearchArticlesParams = z.infer<typeof searchArticlesSchema>;
export type GetArticleParams = z.infer<typeof getArticleSchema>;
