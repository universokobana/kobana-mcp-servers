export interface Config {
    apiUrl: string;
    accessToken: string;
    /** Per-request timeout for Kobana API calls, in milliseconds. */
    apiTimeoutMs?: number;
}
/**
 * Default per-request timeout. Without one, a request whose response never
 * completes (accepted socket, body never finished) hangs the tool call
 * forever — observed live against the statement summary endpoint on
 * 2026-08-24, where two summarize calls sat silent past a client's 125s
 * watchdog. 30s is beyond any healthy endpoint's answer time and short
 * enough for callers to recover within their own budgets.
 */
export declare const DEFAULT_API_TIMEOUT_MS = 30000;
export declare function getConfig(): Config;
export declare function getConfigSafe(): Config | null;
//# sourceMappingURL=config.d.ts.map