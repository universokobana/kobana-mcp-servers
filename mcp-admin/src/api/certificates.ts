import { KobanaApiClient } from './client.js';
import {
  Certificate,
  CreateCertificateInput,
  ListCertificatesFilters,
} from '../types/api.js';

const BASE_PATH = '/v2/admin/certificates';

export async function listCertificates(
  client: KobanaApiClient,
  filters?: ListCertificatesFilters
): Promise<Certificate[]> {
  return client.get<Certificate[]>(BASE_PATH, filters as Record<string, unknown>);
}

export async function createCertificate(
  client: KobanaApiClient,
  input: CreateCertificateInput,
  idempotencyKey?: string
): Promise<Certificate> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<Certificate>(BASE_PATH, { certificate: input }, headers);
}
