import { HelpCenterError } from '../api/client.js';
import * as articlesApi from '../api/articles.js';
import { searchArticlesSchema, getArticleSchema } from '../types/schemas.js';
function formatError(error) {
    if (error instanceof HelpCenterError) {
        return {
            error: error.message,
            details: error.toJSON(),
        };
    }
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: 'Unknown error occurred' };
}
export const searchArticlesTool = {
    name: 'search_articles',
    description: 'Search for help articles in the Kobana Help Center. Returns a list of articles matching the search query with their titles, descriptions, and URLs.',
    inputSchema: searchArticlesSchema,
    handler: async (client, args) => {
        try {
            const params = searchArticlesSchema.parse(args);
            const results = await articlesApi.searchArticles(client, params.query);
            return { success: true, data: results };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const getArticleTool = {
    name: 'get_article',
    description: 'Get the full content of a help article. The content is returned in Markdown format for easy reading. Provide the full URL of the article.',
    inputSchema: getArticleSchema,
    handler: async (client, args) => {
        try {
            const params = getArticleSchema.parse(args);
            const article = await articlesApi.getArticle(client, params.url);
            return { success: true, data: article };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const articlesTools = [
    searchArticlesTool,
    getArticleTool,
];
//# sourceMappingURL=articles.js.map