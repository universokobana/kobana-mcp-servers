import { Config } from '../config.js';
import { ApiError } from '../types/api.js';
export declare class KobanaApiClient {
    private baseUrl;
    private accessToken;
    private timeoutMs;
    constructor(config: Config);
    private request;
    get<T>(path: string, params?: Record<string, unknown>): Promise<T>;
    post<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T>;
    put<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T>;
    patch<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T>;
    delete<T>(path: string): Promise<T>;
}
/** A request that did not complete (headers or body) within the timeout.
 * Distinct from KobanaApiError: the server gave no answer to report. */
export declare class KobanaApiTimeoutError extends Error {
    method: string;
    path: string;
    timeoutMs: number;
    constructor(method: string, path: string, timeoutMs: number);
}
export declare class KobanaApiError extends Error {
    statusCode: number;
    errorData: ApiError;
    constructor(statusCode: number, errorData: ApiError);
    toJSON(): {
        statusCode: number;
        error: string;
        message: string | undefined;
        errors: Record<string, string[]> | undefined;
    };
}
//# sourceMappingURL=client.d.ts.map