export class KobanaApiClient {
    baseUrl;
    accessToken;
    constructor(config) {
        this.baseUrl = config.apiUrl;
        this.accessToken = config.accessToken;
    }
    async request(method, path, body, headers) {
        const url = `${this.baseUrl}${path}`;
        const requestHeaders = {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'kobana-mcp-server/1.0.0',
            ...headers,
        };
        const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
            // Refuse to follow HTTP redirects. Kobana API endpoints don't
            // redirect under normal operation, and a redirect target could be
            // an attacker-controlled host that would receive the bearer token
            // attached to this request. Closes the second hop of the
            // X-Kobana-Api-Url SSRF chain (WH report 2026-06-15 Finding 1).
            redirect: 'error',
        });
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            }
            catch {
                errorData = {
                    error: `HTTP ${response.status}`,
                    message: response.statusText,
                };
            }
            throw new KobanaApiError(response.status, errorData);
        }
        if (response.status === 204) {
            return {};
        }
        return response.json();
    }
    async get(path, params) {
        let queryString = '';
        if (params) {
            const filteredParams = Object.entries(params)
                .filter(([, value]) => value !== undefined && value !== null)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
            if (filteredParams.length > 0) {
                queryString = '?' + filteredParams.join('&');
            }
        }
        return this.request('GET', path + queryString);
    }
    async post(path, body, headers) {
        return this.request('POST', path, body, headers);
    }
    async put(path, body, headers) {
        return this.request('PUT', path, body, headers);
    }
    async patch(path, body, headers) {
        return this.request('PATCH', path, body, headers);
    }
    async delete(path) {
        return this.request('DELETE', path);
    }
}
export class KobanaApiError extends Error {
    statusCode;
    errorData;
    constructor(statusCode, errorData) {
        super(errorData.message || errorData.error);
        this.statusCode = statusCode;
        this.errorData = errorData;
        this.name = 'KobanaApiError';
    }
    toJSON() {
        return {
            statusCode: this.statusCode,
            error: this.errorData.error,
            message: this.errorData.message,
            errors: this.errorData.errors,
        };
    }
}
//# sourceMappingURL=client.js.map