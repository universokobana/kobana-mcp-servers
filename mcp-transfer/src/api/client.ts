import { Config } from '../config.js';
import { ApiError } from '../types/api.js';

export class KobanaApiClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(config: Config) {
    this.baseUrl = config.apiUrl;
    this.accessToken = config.accessToken;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const requestHeaders: Record<string, string> = {
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
    });

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json() as ApiError;
      } catch {
        errorData = {
          error: `HTTP ${response.status}`,
          message: response.statusText,
        };
      }
      throw new KobanaApiError(response.status, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    let queryString = '';
    if (params) {
      const filteredParams = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

      if (filteredParams.length > 0) {
        queryString = '?' + filteredParams.join('&');
      }
    }
    return this.request<T>('GET', path + queryString);
  }

  async post<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', path, body, headers);
  }

  async put<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', path, body, headers);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

export class KobanaApiError extends Error {
  constructor(
    public statusCode: number,
    public errorData: ApiError
  ) {
    super(errorData.message || errorData.error);
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
