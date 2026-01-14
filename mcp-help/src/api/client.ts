import { Config } from '../config.js';
import { ApiError } from '../types/api.js';

export class HelpCenterClient {
  private baseUrl: string;
  private locale: string;

  constructor(config: Config) {
    this.baseUrl = config.helpCenterUrl;
    this.locale = config.locale;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getLocale(): string {
    return this.locale;
  }

  async fetchPage(url: string): Promise<string> {
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

  buildSearchUrl(query: string): string {
    const encodedQuery = encodeURIComponent(query);
    return `${this.baseUrl}/${this.locale}/?q=${encodedQuery}`;
  }
}

export class HelpCenterError extends Error {
  constructor(
    public statusCode: number,
    public errorData: ApiError
  ) {
    super(errorData.message || errorData.error);
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
