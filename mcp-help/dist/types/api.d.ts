export interface ArticleSearchResult {
    id: string;
    title: string;
    description: string;
    url: string;
}
export interface Article {
    id: string;
    title: string;
    url: string;
    content: string;
    relatedArticles?: ArticleSearchResult[];
}
export interface SearchResponse {
    query: string;
    results: ArticleSearchResult[];
    total: number;
}
export interface ApiError {
    error: string;
    message?: string;
}
//# sourceMappingURL=api.d.ts.map