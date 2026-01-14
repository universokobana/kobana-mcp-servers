import * as pagesApi from '../api/pages.js';
import { searchPagesSchema, getPageSchema } from '../types/schemas.js';
function formatError(error) {
    if (error instanceof Error) {
        return {
            error: error.message,
            details: error.stack,
        };
    }
    return {
        error: String(error),
    };
}
export const searchPagesTool = {
    name: 'search_pages',
    description: 'Search for pages on the Kobana website by a search term. Returns matching pages with snippets showing where the term appears. Useful for finding documentation, help articles, and feature descriptions.',
    inputSchema: searchPagesSchema,
    handler: async (args) => {
        try {
            const params = searchPagesSchema.parse(args);
            const result = await pagesApi.searchPages(params);
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const getPageTool = {
    name: 'get_page',
    description: 'Get the full content of a specific page from the Kobana website. Returns the complete markdown content along with the live URL. Use the path from search_pages results or specify a known path.',
    inputSchema: getPageSchema,
    handler: async (args) => {
        try {
            const params = getPageSchema.parse(args);
            const result = await pagesApi.getPage(params.path);
            if (!result) {
                return {
                    success: false,
                    error: `Page not found: ${params.path}`,
                };
            }
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const pagesTools = [
    searchPagesTool,
    getPageTool,
];
//# sourceMappingURL=pages.js.map