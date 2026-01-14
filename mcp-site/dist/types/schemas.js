import { z } from 'zod';
export const searchPagesSchema = z.object({
    query: z.string().min(1).describe('Search term to look for in the site content'),
    language: z.enum(['pt', 'en']).optional().describe('Language filter (pt or en). If not specified, searches all languages'),
    limit: z.number().int().min(1).max(50).optional().describe('Maximum number of results to return (default: 10, max: 50)'),
}).describe('Search for pages containing a specific term');
export const getPageSchema = z.object({
    path: z.string().min(1).describe('Path to the page file (e.g., "pt/recursos/boleto.md" or "en/features/billing.md")'),
}).describe('Get the full content of a specific page');
//# sourceMappingURL=schemas.js.map