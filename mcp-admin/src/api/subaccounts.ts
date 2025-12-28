import { KobanaApiClient } from './client.js';
import {
  Subaccount,
  CreateSubaccountInput,
  UpdateSubaccountInput,
  ListSubaccountsFilters,
} from '../types/api.js';

const BASE_PATH = '/v2/admin/subaccounts';

export async function listSubaccounts(
  client: KobanaApiClient,
  filters?: ListSubaccountsFilters
): Promise<Subaccount[]> {
  return client.get<Subaccount[]>(BASE_PATH, filters as Record<string, unknown>);
}

export async function createSubaccount(
  client: KobanaApiClient,
  input: CreateSubaccountInput,
  idempotencyKey?: string
): Promise<Subaccount> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<Subaccount>(BASE_PATH, { subaccount: input }, headers);
}

export async function getSubaccount(
  client: KobanaApiClient,
  id: number
): Promise<Subaccount> {
  return client.get<Subaccount>(`${BASE_PATH}/${id}`);
}

export async function updateSubaccount(
  client: KobanaApiClient,
  id: number,
  input: UpdateSubaccountInput,
  idempotencyKey?: string
): Promise<Subaccount> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.put<Subaccount>(`${BASE_PATH}/${id}`, { subaccount: input }, headers);
}
