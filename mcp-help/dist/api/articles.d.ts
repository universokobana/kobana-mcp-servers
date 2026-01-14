import { HelpCenterClient } from './client.js';
import { Article, SearchResponse } from '../types/api.js';
/**
 * Search for articles in the help center
 */
export declare function searchArticles(client: HelpCenterClient, query: string): Promise<SearchResponse>;
/**
 * Get a specific article by URL
 */
export declare function getArticle(client: HelpCenterClient, url: string): Promise<Article>;
//# sourceMappingURL=articles.d.ts.map