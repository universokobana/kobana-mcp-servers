import { KobanaApiClient } from './client.js';
import {
  BankBilletQuery,
  CreateBankBilletQueryInput,
  ListBankBilletQueriesFilters,
  PaginatedResponse,
  SingleResponse,
} from '../types/api.js';

const BASE_PATH = '/v2/data/bank_billet_queries';

export async function listBankBilletQueries(
  client: KobanaApiClient,
  filters?: ListBankBilletQueriesFilters
): Promise<PaginatedResponse<BankBilletQuery>> {
  return client.get<PaginatedResponse<BankBilletQuery>>(BASE_PATH, filters as Record<string, unknown>);
}

export async function createBankBilletQuery(
  client: KobanaApiClient,
  input: CreateBankBilletQueryInput,
  idempotencyKey?: string
): Promise<SingleResponse<BankBilletQuery>> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<SingleResponse<BankBilletQuery>>(BASE_PATH, { bank_billet_query: input }, headers);
}
