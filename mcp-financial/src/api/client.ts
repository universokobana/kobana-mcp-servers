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
    const isFormData = body instanceof FormData;

    const requestHeaders: Record<string, string> = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
      'User-Agent': 'kobana-mcp-server/1.0.0',
      // FormData bodies must not carry an explicit Content-Type: fetch
      // sets one itself (multipart/form-data; boundary=...) and a
      // hardcoded value here would omit the boundary and break parsing.
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    };

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
      // Refuse to follow HTTP redirects. Kobana API endpoints don't
      // redirect under normal operation, and a redirect target could be
      // an attacker-controlled host that would receive the bearer token
      // attached to this request. Closes the second hop of the
      // X-Kobana-Api-Url SSRF chain (WH report 2026-06-15 Finding 1).
      redirect: 'error',
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

  async postForm<T>(path: string, form: FormData, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', path, form, headers);
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
