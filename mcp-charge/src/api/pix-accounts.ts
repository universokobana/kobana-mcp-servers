import { KobanaApiClient } from './client.js';
import {
  PixAccount,
  CreatePixAccountInput,
  UpdatePixAccountInput,
  PaginationParams,
} from '../types/api.js';

const BASE_PATH = '/v2/charge/pix_accounts';

export async function listPixAccounts(
  client: KobanaApiClient,
  params?: PaginationParams
): Promise<PixAccount[]> {
  return client.get<PixAccount[]>(BASE_PATH, params as Record<string, unknown>);
}

export async function createPixAccount(
  client: KobanaApiClient,
  input: CreatePixAccountInput
): Promise<PixAccount> {
  return client.post<PixAccount>(BASE_PATH, { pix_account: input });
}

export async function getPixAccount(
  client: KobanaApiClient,
  uid: string
): Promise<PixAccount> {
  return client.get<PixAccount>(`${BASE_PATH}/${uid}`);
}

export async function updatePixAccount(
  client: KobanaApiClient,
  uid: string,
  input: UpdatePixAccountInput,
  idempotencyKey?: string
): Promise<PixAccount> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.put<PixAccount>(`${BASE_PATH}/${uid}`, { pix_account: input }, headers);
}

export async function deletePixAccount(
  client: KobanaApiClient,
  uid: string
): Promise<{ message: string }> {
  return client.delete<{ message: string }>(`${BASE_PATH}/${uid}`);
}
