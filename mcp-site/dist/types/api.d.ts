export interface SearchResult {
    path: string;
    url: string;
    title: string;
    snippet: string;
    language: 'pt' | 'en';
    score: number;
}
export interface SearchResponse {
    query: string;
    results: SearchResult[];
    total: number;
}
export interface PageContent {
    path: string;
    url: string;
    title: string;
    content: string;
    language: 'pt' | 'en';
}
export interface CacheStatus {
    exists: boolean;
    path: string;
    lastUpdated?: Date;
}
//# sourceMappingURL=api.d.ts.map