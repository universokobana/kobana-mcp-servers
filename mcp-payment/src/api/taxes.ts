import { KobanaApiClient } from './client.js';
import {
  PaymentTax,
  CreateTaxInput,
  PaginationParams,
} from '../types/api.js';

const BASE_PATH = '/v2/payment/taxes';

export async function listTaxes(
  client: KobanaApiClient,
  params?: PaginationParams
): Promise<PaymentTax[]> {
  return client.get<PaymentTax[]>(BASE_PATH, params as Record<string, unknown>);
}

export async function createTax(
  client: KobanaApiClient,
  input: CreateTaxInput
): Promise<PaymentTax> {
  return client.post<PaymentTax>(BASE_PATH, input);
}

export async function getTax(
  client: KobanaApiClient,
  uid: string
): Promise<PaymentTax> {
  return client.get<PaymentTax>(`${BASE_PATH}/${uid}`);
}
