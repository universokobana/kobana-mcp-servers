import { KobanaApiClient } from './client.js';
import {
  StatementTransaction,
  FinancialAccountCommand,
  ListStatementTransactionsFilters,
} from '../types/api.js';

function getBasePath(financialAccountUid: string): string {
  return `/v2/financial/accounts/${financialAccountUid}/statement_transactions`;
}

export async function listStatementTransactions(
  client: KobanaApiClient,
  financialAccountUid: string,
  filters?: ListStatementTransactionsFilters
): Promise<StatementTransaction[]> {
  return client.get<StatementTransaction[]>(
    getBasePath(financialAccountUid),
    filters as Record<string, unknown>
  );
}

export async function syncStatementTransactions(
  client: KobanaApiClient,
  financialAccountUid: string,
  idempotencyKey?: string
): Promise<FinancialAccountCommand> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<FinancialAccountCommand>(
    `${getBasePath(financialAccountUid)}/sync`,
    {},
    headers
  );
}
