import { Config } from '../config.js';
import { ApiError } from '../types/api.js';
export declare class HelpCenterClient {
    private baseUrl;
    private locale;
    constructor(config: Config);
    getBaseUrl(): string;
    getLocale(): string;
    fetchPage(url: string): Promise<string>;
    buildSearchUrl(query: string): string;
}
export declare class HelpCenterError extends Error {
    statusCode: number;
    errorData: ApiError;
    constructor(statusCode: number, errorData: ApiError);
    toJSON(): {
        statusCode: number;
        error: string;
        message: string | undefined;
    };
}
//# sourceMappingURL=client.d.ts.map