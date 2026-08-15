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

  const form = new FormData();
  const fileBytes = Buffer.from(input.source, 'base64');
  form.append('source', new Blob([fileBytes]), input.file_name || 'statement');
  if (input.external_id) {
    form.append('external_id', input.external_id);
  }
  if (input.custom_data) {
    form.append('custom_data', JSON.stringify(input.custom_data));
  }
  if (input.tags) {
    for (const tag of input.tags) {
      form.append('tags[]', tag);
    }
  }

  return client.postForm<Import>(getBasePath(financialAccountUid), form, headers);
}

export async function getStatementTransactionImport(
  client: KobanaApiClient,
  financialAccountUid: string,
  uid: string
): Promise<Import> {
  return client.get<Import>(`${getBasePath(financialAccountUid)}/${uid}`);
}
