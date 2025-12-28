import { KobanaApiClient } from './client.js';
import {
  FinancialAccount,
  CreateFinancialAccountInput,
  UpdateFinancialAccountInput,
  ListFinancialAccountsFilters,
} from '../types/api.js';

const BASE_PATH = '/v2/financial/accounts';

export async function listFinancialAccounts(
  client: KobanaApiClient,
  filters?: ListFinancialAccountsFilters
): Promise<FinancialAccount[]> {
  return client.get<FinancialAccount[]>(BASE_PATH, filters as Record<string, unknown>);
}

export async function createFinancialAccount(
  client: KobanaApiClient,
  input: CreateFinancialAccountInput,
  idempotencyKey?: string
): Promise<FinancialAccount> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<FinancialAccount>(BASE_PATH, { financial_account: input }, headers);
}

export async function getFinancialAccount(
  client: KobanaApiClient,
  id: string
): Promise<FinancialAccount> {
  return client.get<FinancialAccount>(`${BASE_PATH}/${id}`);
}

export async function updateFinancialAccount(
  client: KobanaApiClient,
  id: string,
  input: UpdateFinancialAccountInput
): Promise<FinancialAccount> {
  return client.put<FinancialAccount>(`${BASE_PATH}/${id}`, { financial_account: input });
}
