export class HelpCenterClient {
    baseUrl;
    locale;
    constructor(config) {
        this.baseUrl = config.helpCenterUrl;
        this.locale = config.locale;
    }
    getBaseUrl() {
        return this.baseUrl;
    }
    getLocale() {
        return this.locale;
    }
    async fetchPage(url) {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; KobanaMCPHelp/1.0)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            },
        });
        if (!response.ok) {
            throw new HelpCenterError(response.status, {
                error: `HTTP ${response.status}`,
                message: response.statusText,
            });
        }
        return response.text();
    }
    buildSearchUrl(query) {
        const encodedQuery = encodeURIComponent(query);
        return `${this.baseUrl}/${this.locale}/?q=${encodedQuery}`;
    }
}
export class HelpCenterError extends Error {
    statusCode;
    errorData;
    constructor(statusCode, errorData) {
        super(errorData.message || errorData.error);
        this.statusCode = statusCode;
        this.errorData = errorData;
        this.name = 'HelpCenterError';
    }
    toJSON() {
        return {
            statusCode: this.statusCode,
            error: this.errorData.error,
            message: this.errorData.message,
        };
    }
}
//# sourceMappingURL=client.js.map