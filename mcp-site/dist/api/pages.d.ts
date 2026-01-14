import type { SearchResponse, PageContent } from '../types/api.js';
interface SearchOptions {
    query: string;
    language?: 'pt' | 'en';
    limit?: number;
}
export declare function searchPages(options: SearchOptions): Promise<SearchResponse>;
export declare function getPage(filePath: string): Promise<PageContent | null>;
export declare function listAllPages(language?: 'pt' | 'en'): Promise<string[]>;
export {};
//# sourceMappingURL=pages.d.ts.map