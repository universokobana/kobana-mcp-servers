import { KobanaApiClient } from './client.js';
import {
  PaymentBankBillet,
  CreateBankBilletInput,
  PaginationParams,
} from '../types/api.js';

const BASE_PATH = '/v2/payment/bank_billets';

export async function listBankBillets(
  client: KobanaApiClient,
  params?: PaginationParams
): Promise<PaymentBankBillet[]> {
  return client.get<PaymentBankBillet[]>(BASE_PATH, params as Record<string, unknown>);
}

export async function createBankBillet(
  client: KobanaApiClient,
  input: CreateBankBilletInput
): Promise<PaymentBankBillet> {
  return client.post<PaymentBankBillet>(BASE_PATH, input);
}

export async function getBankBillet(
  client: KobanaApiClient,
  uid: string
): Promise<PaymentBankBillet> {
  return client.get<PaymentBankBillet>(`${BASE_PATH}/${uid}`);
}
