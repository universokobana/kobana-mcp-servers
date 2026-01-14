import { z } from 'zod';
export declare const searchPagesSchema: z.ZodObject<{
    query: z.ZodString;
    language: z.ZodOptional<z.ZodEnum<["pt", "en"]>>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    language?: "pt" | "en" | undefined;
    limit?: number | undefined;
}, {
    query: string;
    language?: "pt" | "en" | undefined;
    limit?: number | undefined;
}>;
export declare const getPageSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
//# sourceMappingURL=schemas.d.ts.map