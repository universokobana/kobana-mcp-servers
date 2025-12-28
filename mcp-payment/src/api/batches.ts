import { KobanaApiClient } from './client.js';
import {
  PaymentBatch,
  CreateBankBilletBatchInput,
  CreatePixBatchInput,
  CreateDarfBatchInput,
  CreateTaxBatchInput,
  CreateUtilityBatchInput,
  PaginationParams,
} from '../types/api.js';

const BASE_PATH = '/v2/payment/batches';

// List and Get Batches

export async function listBatches(
  client: KobanaApiClient,
  params?: PaginationParams
): Promise<PaymentBatch[]> {
  return client.get<PaymentBatch[]>(BASE_PATH, params as Record<string, unknown>);
}

export async function getBatch(
  client: KobanaApiClient,
  uid: string
): Promise<PaymentBatch> {
  return client.get<PaymentBatch>(`${BASE_PATH}/${uid}`);
}

// Approve and Reprove Batches

export async function approveBatch(
  client: KobanaApiClient,
  uid: string
): Promise<PaymentBatch> {
  return client.put<PaymentBatch>(`${BASE_PATH}/${uid}/approve`);
}

export async function reproveBatch(
  client: KobanaApiClient,
  uid: string
): Promise<PaymentBatch> {
  return client.put<PaymentBatch>(`${BASE_PATH}/${uid}/reprove`);
}

// Create Batches by Type

export async function createBankBilletBatch(
  client: KobanaApiClient,
  input: CreateBankBilletBatchInput
): Promise<PaymentBatch> {
  return client.post<PaymentBatch>('/v2/payment/bank_billet_batches', input);
}

export async function createPixBatch(
  client: KobanaApiClient,
  input: CreatePixBatchInput
): Promise<PaymentBatch> {
  return client.post<PaymentBatch>('/v2/payment/pix_batches', input);
}

export async function createDarfBatch(
  client: KobanaApiClient,
  input: CreateDarfBatchInput
): Promise<PaymentBatch> {
  return client.post<PaymentBatch>('/v2/payment/darf_batches', input);
}

export async function createTaxBatch(
  client: KobanaApiClient,
  input: CreateTaxBatchInput
): Promise<PaymentBatch> {
  return client.post<PaymentBatch>('/v2/payment/tax_batches', input);
}

export async function createUtilityBatch(
  client: KobanaApiClient,
  input: CreateUtilityBatchInput
): Promise<PaymentBatch> {
  return client.post<PaymentBatch>('/v2/payment/utility_batches', input);
}
