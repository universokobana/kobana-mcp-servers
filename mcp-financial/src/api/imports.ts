import { KobanaApiClient } from './client.js';
import {
  Import,
  CreateImportInput,
  ListImportsFilters,
} from '../types/api.js';

function getBasePath(financialAccountUid: string): string {
  return `/v2/financial/accounts/${financialAccountUid}/statement_transactions/imports`;
}

export async function listStatementTransactionImports(
  client: KobanaApiClient,
  financialAccountUid: string,
  filters?: ListImportsFilters
): Promise<Import[]> {
  return client.get<Import[]>(
    getBasePath(financialAccountUid),
    filters as Record<string, unknown>
  );
}

export async function createStatementTransactionImport(
  client: KobanaApiClient,
  financialAccountUid: string,
  input: CreateImportInput,
  idempotencyKey?: string
): Promise<Import> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<Import>(
    getBasePath(financialAccountUid),
    { import: input },
    headers
  );
}

export async function getStatementTransactionImport(
  client: KobanaApiClient,
  financialAccountUid: string,
  uid: string
): Promise<Import> {
  return client.get<Import>(`${getBasePath(financialAccountUid)}/${uid}`);
}
