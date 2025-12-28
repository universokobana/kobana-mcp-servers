import { KobanaApiClient } from './client.js';
import {
  FinancialAccountBalance,
  CreateFinancialAccountBalanceInput,
  ListBalancesFilters,
} from '../types/api.js';

function getBasePath(financialAccountUid: string): string {
  return `/v2/financial/accounts/${financialAccountUid}/balances`;
}

export async function listFinancialAccountBalances(
  client: KobanaApiClient,
  financialAccountUid: string,
  filters?: ListBalancesFilters
): Promise<FinancialAccountBalance[]> {
  return client.get<FinancialAccountBalance[]>(
    getBasePath(financialAccountUid),
    filters as Record<string, unknown>
  );
}

export async function createFinancialAccountBalance(
  client: KobanaApiClient,
  financialAccountUid: string,
  input: CreateFinancialAccountBalanceInput,
  idempotencyKey?: string
): Promise<FinancialAccountBalance> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<FinancialAccountBalance>(
    getBasePath(financialAccountUid),
    { financial_account_balance: input },
    headers
  );
}

export async function getFinancialAccountBalance(
  client: KobanaApiClient,
  financialAccountUid: string,
  balanceUid: string
): Promise<FinancialAccountBalance> {
  return client.get<FinancialAccountBalance>(
    `${getBasePath(financialAccountUid)}/${balanceUid}`
  );
}
