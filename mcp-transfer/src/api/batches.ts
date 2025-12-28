import { KobanaApiClient } from './client.js';
import {
  TransferBatch,
  ListBatchesFilters,
  ApiResponse,
} from '../types/api.js';

const BASE_PATH = '/v2/transfer/batches';

export async function listTransferBatches(
  client: KobanaApiClient,
  filters?: ListBatchesFilters
): Promise<ApiResponse<TransferBatch[]>> {
  return client.get<ApiResponse<TransferBatch[]>>(BASE_PATH, filters as Record<string, unknown>);
}

export async function getTransferBatch(
  client: KobanaApiClient,
  uid: string
): Promise<ApiResponse<TransferBatch>> {
  return client.get<ApiResponse<TransferBatch>>(`${BASE_PATH}/${uid}`);
}

export async function approveTransferBatch(
  client: KobanaApiClient,
  uid: string
): Promise<ApiResponse<TransferBatch>> {
  return client.put<ApiResponse<TransferBatch>>(`${BASE_PATH}/${uid}/approve`);
}

export async function reproveTransferBatch(
  client: KobanaApiClient,
  uid: string
): Promise<ApiResponse<TransferBatch>> {
  return client.put<ApiResponse<TransferBatch>>(`${BASE_PATH}/${uid}/reprove`);
}
