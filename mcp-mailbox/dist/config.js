/**
 * Default per-request timeout. Without one, a request whose response never
 * completes (accepted socket, body never finished) hangs the tool call
 * forever — observed live against the statement summary endpoint on
 * 2026-08-24, where two summarize calls sat silent past a client's 125s
 * watchdog. 30s is beyond any healthy endpoint's answer time and short
 * enough for callers to recover within their own budgets.
 */
export const DEFAULT_API_TIMEOUT_MS = 30_000;
function parseTimeoutMs(raw) {
    const parsed = raw ? Number(raw) : NaN;
    return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_API_TIMEOUT_MS;
}
export function getConfig() {
    const accessToken = process.env.KOBANA_ACCESS_TOKEN;
    if (!accessToken) {
        throw new Error('KOBANA_ACCESS_TOKEN environment variable is required');
    }
    return {
        apiUrl: process.env.KOBANA_API_URL || 'https://api.kobana.com.br',
        accessToken,
        apiTimeoutMs: parseTimeoutMs(process.env.KOBANA_API_TIMEOUT_MS),
    };
}
export function getConfigSafe() {
    try {
        return getConfig();
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=config.js.map