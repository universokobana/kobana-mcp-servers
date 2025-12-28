import { KobanaApiClient } from './client.js';
import {
  Transfer,
  TransferBatch,
  CreateTransferPixInput,
  CreateTransferBatchPixInput,
  ListTransfersFilters,
  ApiResponse,
} from '../types/api.js';

const BASE_PATH = '/v2/transfer/pix';
const BATCH_PATH = '/v2/transfer/pix_batches';

export async function listTransferPix(
  client: KobanaApiClient,
  filters?: ListTransfersFilters
): Promise<ApiResponse<Transfer[]>> {
  return client.get<ApiResponse<Transfer[]>>(BASE_PATH, filters as Record<string, unknown>);
}

export async function createTransferPix(
  client: KobanaApiClient,
  input: CreateTransferPixInput,
  idempotencyKey?: string
): Promise<ApiResponse<Transfer>> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<ApiResponse<Transfer>>(BASE_PATH, { transfer: input }, headers);
}

export async function getTransferPix(
  client: KobanaApiClient,
  uid: string
): Promise<ApiResponse<Transfer>> {
  return client.get<ApiResponse<Transfer>>(`${BASE_PATH}/${uid}`);
}

export async function createTransferPixBatch(
  client: KobanaApiClient,
  input: CreateTransferBatchPixInput,
  idempotencyKey?: string
): Promise<ApiResponse<TransferBatch>> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<ApiResponse<TransferBatch>>(BATCH_PATH, { transfer_batch: input }, headers);
}
