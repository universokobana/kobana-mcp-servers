import { KobanaApiClient } from './client.js';
import {
  EdiBox,
  CreateEdiBoxInput,
  UpdateEdiBoxInput,
  ListEdiBoxesFilters,
  PaginatedResponse,
  SingleResponse,
} from '../types/api.js';

const BASE_PATH = '/v2/edi/edi_boxes';

export async function listEdiBoxes(
  client: KobanaApiClient,
  params?: ListEdiBoxesFilters
): Promise<PaginatedResponse<EdiBox>> {
  return client.get<PaginatedResponse<EdiBox>>(BASE_PATH, params as Record<string, unknown>);
}

export async function createEdiBox(
  client: KobanaApiClient,
  input: CreateEdiBoxInput
): Promise<SingleResponse<EdiBox>> {
  return client.post<SingleResponse<EdiBox>>(BASE_PATH, input);
}

export async function getEdiBox(
  client: KobanaApiClient,
  uid: string
): Promise<SingleResponse<EdiBox>> {
  return client.get<SingleResponse<EdiBox>>(`${BASE_PATH}/${uid}`);
}

export async function updateEdiBox(
  client: KobanaApiClient,
  uid: string,
  input: UpdateEdiBoxInput
): Promise<SingleResponse<EdiBox>> {
  return client.put<SingleResponse<EdiBox>>(`${BASE_PATH}/${uid}`, input);
}
