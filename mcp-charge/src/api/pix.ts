import { KobanaApiClient } from './client.js';
import {
  PixCharge,
  PixCommand,
  CreatePixChargeInput,
  UpdatePixChargeInput,
  ListPixChargesFilters,
} from '../types/api.js';

const BASE_PATH = '/v2/charge/pix';

export async function listPixCharges(
  client: KobanaApiClient,
  filters?: ListPixChargesFilters
): Promise<PixCharge[]> {
  return client.get<PixCharge[]>(BASE_PATH, filters as Record<string, unknown>);
}

export async function createPixCharge(
  client: KobanaApiClient,
  input: CreatePixChargeInput,
  idempotencyKey?: string
): Promise<PixCharge> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<PixCharge>(BASE_PATH, { pix: input }, headers);
}

export async function getPixCharge(
  client: KobanaApiClient,
  uid: string
): Promise<PixCharge> {
  return client.get<PixCharge>(`${BASE_PATH}/${uid}`);
}

export async function deletePixCharge(
  client: KobanaApiClient,
  uid: string
): Promise<void> {
  await client.delete<void>(`${BASE_PATH}/${uid}`);
}

export async function updatePixCharge(
  client: KobanaApiClient,
  pixUid: string,
  input: UpdatePixChargeInput,
  idempotencyKey?: string
): Promise<PixCommand> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.put<PixCommand>(`${BASE_PATH}/${pixUid}/update`, { pix: input }, headers);
}

export async function cancelPixCharge(
  client: KobanaApiClient,
  pixUid: string,
  idempotencyKey?: string
): Promise<PixCommand> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.put<PixCommand>(`${BASE_PATH}/${pixUid}/cancel`, undefined, headers);
}
