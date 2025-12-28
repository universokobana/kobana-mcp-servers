import { KobanaApiClient } from './client.js';
import {
  PaymentDarf,
  CreateDarfInput,
  PaginationParams,
} from '../types/api.js';

const BASE_PATH = '/v2/payment/darfs';

export async function listDarfs(
  client: KobanaApiClient,
  params?: PaginationParams
): Promise<PaymentDarf[]> {
  return client.get<PaymentDarf[]>(BASE_PATH, params as Record<string, unknown>);
}

export async function createDarf(
  client: KobanaApiClient,
  input: CreateDarfInput
): Promise<PaymentDarf> {
  return client.post<PaymentDarf>(BASE_PATH, input);
}

export async function getDarf(
  client: KobanaApiClient,
  uid: string
): Promise<PaymentDarf> {
  return client.get<PaymentDarf>(`${BASE_PATH}/${uid}`);
}
