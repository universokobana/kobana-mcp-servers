import { KobanaApiClient } from './client.js';
import {
  ChargePayment,
  CreateChargePaymentInput,
  ListChargePaymentsFilters,
} from '../types/automatic-pix.js';

const BASE_PATH = '/v2/charge/payments';

export async function listChargePayments(
  client: KobanaApiClient,
  filters?: ListChargePaymentsFilters
): Promise<ChargePayment[]> {
  return client.get<ChargePayment[]>(BASE_PATH, filters as Record<string, unknown>);
}

export async function createChargePayment(
  client: KobanaApiClient,
  input: CreateChargePaymentInput
): Promise<ChargePayment> {
  return client.post<ChargePayment>(BASE_PATH, { payment: input });
}

export async function getChargePayment(
  client: KobanaApiClient,
  uid: string
): Promise<ChargePayment> {
  return client.get<ChargePayment>(`${BASE_PATH}/${uid}`);
}

export async function deleteChargePayment(
  client: KobanaApiClient,
  uid: string
): Promise<void> {
  await client.delete<void>(`${BASE_PATH}/${uid}`);
}
