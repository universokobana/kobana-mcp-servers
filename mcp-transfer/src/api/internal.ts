import { KobanaApiClient } from './client.js';
import {
  Transfer,
  TransferBatch,
  CreateTransferInternalInput,
  CreateTransferBatchInternalInput,
  ListTransfersFilters,
  ApiResponse,
} from '../types/api.js';

const BASE_PATH = '/v2/transfer/internal';
const BATCH_PATH = '/v2/transfer/internal_batches';

export async function listTransferInternal(
  client: KobanaApiClient,
  filters?: ListTransfersFilters
): Promise<ApiResponse<Transfer[]>> {
  return client.get<ApiResponse<Transfer[]>>(BASE_PATH, filters as Record<string, unknown>);
}

export async function createTransferInternal(
  client: KobanaApiClient,
  input: CreateTransferInternalInput,
  idempotencyKey?: string
): Promise<ApiResponse<Transfer>> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<ApiResponse<Transfer>>(BASE_PATH, { transfer: input }, headers);
}

export async function getTransferInternal(
  client: KobanaApiClient,
  uid: string
): Promise<ApiResponse<Transfer>> {
  return client.get<ApiResponse<Transfer>>(`${BASE_PATH}/${uid}`);
}

export async function createTransferInternalBatch(
  client: KobanaApiClient,
  input: CreateTransferBatchInternalInput,
  idempotencyKey?: string
): Promise<ApiResponse<TransferBatch>> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<ApiResponse<TransferBatch>>(BATCH_PATH, { transfer_batch: input }, headers);
}
