import { KobanaApiClient } from './client.js';
import {
  ListStatementTransactionsFilters,
  ListStatementTransactionsResponse,
  SummarizeStatementTransactionsFilters,
  SummarizeStatementTransactionsResponse,
  ListStatementTransactionSyncsFilters,
  StatementSyncRequest,
  SyncStatementTransactionsInput,
  SyncStatementTransactionsResponse,
} from '../types/api.js';

function getBasePath(financialAccountUid: string): string {
  return `/v2/financial/accounts/${financialAccountUid}/statement_transactions`;
}

export async function listStatementTransactions(
  client: KobanaApiClient,
  financialAccountUid: string,
  filters?: ListStatementTransactionsFilters
): Promise<ListStatementTransactionsResponse> {
  return client.get<ListStatementTransactionsResponse>(
    getBasePath(financialAccountUid),
    filters as Record<string, unknown>
  );
}

export async function summarizeStatementTransactions(
  client: KobanaApiClient,
  financialAccountUid: string,
  filters?: SummarizeStatementTransactionsFilters
): Promise<SummarizeStatementTransactionsResponse> {
  return client.get<SummarizeStatementTransactionsResponse>(
    `${getBasePath(financialAccountUid)}/summary`,
    filters as Record<string, unknown>
  );
}

export async function syncStatementTransactions(
  client: KobanaApiClient,
  financialAccountUid: string,
  input?: SyncStatementTransactionsInput,
  idempotencyKey?: string
): Promise<SyncStatementTransactionsResponse> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<SyncStatementTransactionsResponse>(
    `${getBasePath(financialAccountUid)}/sync`,
    input ?? {},
    headers
  );
}

export async function listStatementTransactionSyncs(
  client: KobanaApiClient,
  financialAccountUid: string,
  filters?: ListStatementTransactionSyncsFilters
): Promise<StatementSyncRequest[]> {
  return client.get<StatementSyncRequest[]>(
    `${getBasePath(financialAccountUid)}/syncs`,
    filters as Record<string, unknown>
  );
}

export async function getStatementTransactionSync(
  client: KobanaApiClient,
  financialAccountUid: string,
  uid: string
): Promise<StatementSyncRequest> {
  return client.get<StatementSyncRequest>(`${getBasePath(financialAccountUid)}/syncs/${uid}`);
}
