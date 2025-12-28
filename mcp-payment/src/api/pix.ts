import { KobanaApiClient } from './client.js';
import {
  PaymentPix,
  CreatePixInput,
  PaginationParams,
} from '../types/api.js';

const BASE_PATH = '/v2/payment/pix';

export async function listPix(
  client: KobanaApiClient,
  params?: PaginationParams
): Promise<PaymentPix[]> {
  return client.get<PaymentPix[]>(BASE_PATH, params as Record<string, unknown>);
}

export async function createPix(
  client: KobanaApiClient,
  input: CreatePixInput
): Promise<PaymentPix> {
  return client.post<PaymentPix>(BASE_PATH, input);
}

export async function getPix(
  client: KobanaApiClient,
  uid: string
): Promise<PaymentPix> {
  return client.get<PaymentPix>(`${BASE_PATH}/${uid}`);
}
