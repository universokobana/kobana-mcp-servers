import { KobanaApiClient } from './client.js';
import {
  PaymentUtility,
  CreateUtilityInput,
  PaginationParams,
} from '../types/api.js';

const BASE_PATH = '/v2/payment/utilities';

export async function listUtilities(
  client: KobanaApiClient,
  params?: PaginationParams
): Promise<PaymentUtility[]> {
  return client.get<PaymentUtility[]>(BASE_PATH, params as Record<string, unknown>);
}

export async function createUtility(
  client: KobanaApiClient,
  input: CreateUtilityInput
): Promise<PaymentUtility> {
  return client.post<PaymentUtility>(BASE_PATH, input);
}

export async function getUtility(
  client: KobanaApiClient,
  uid: string
): Promise<PaymentUtility> {
  return client.get<PaymentUtility>(`${BASE_PATH}/${uid}`);
}
