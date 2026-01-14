import { z } from 'zod';
export declare const searchArticlesSchema: z.ZodObject<{
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
}, {
    query: string;
}>;
export declare const getArticleSchema: z.ZodObject<{
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
}, {
    url: string;
}>;
export type SearchArticlesParams = z.infer<typeof searchArticlesSchema>;
export type GetArticleParams = z.infer<typeof getArticleSchema>;
//# sourceMappingURL=schemas.d.ts.map