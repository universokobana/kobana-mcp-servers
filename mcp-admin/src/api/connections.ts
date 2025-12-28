import { KobanaApiClient } from './client.js';
import {
  Connection,
  CreateConnectionInput,
  UpdateConnectionInput,
  AssociationInput,
  ListConnectionsFilters,
} from '../types/api.js';

const BASE_PATH = '/v2/admin/connections';

export async function listConnections(
  client: KobanaApiClient,
  filters?: ListConnectionsFilters
): Promise<Connection[]> {
  return client.get<Connection[]>(BASE_PATH, filters as Record<string, unknown>);
}

export async function createConnection(
  client: KobanaApiClient,
  input: CreateConnectionInput,
  idempotencyKey?: string
): Promise<Connection> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<Connection>(BASE_PATH, input, headers);
}

export async function getConnection(
  client: KobanaApiClient,
  uid: string
): Promise<Connection> {
  return client.get<Connection>(`${BASE_PATH}/${uid}`);
}

export async function updateConnection(
  client: KobanaApiClient,
  uid: string,
  input: UpdateConnectionInput,
  idempotencyKey?: string
): Promise<Connection> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.put<Connection>(`${BASE_PATH}/${uid}`, input, headers);
}

export async function deleteConnection(
  client: KobanaApiClient,
  uid: string
): Promise<void> {
  await client.delete<void>(`${BASE_PATH}/${uid}`);
}

export async function createAssociation(
  client: KobanaApiClient,
  connectionUid: string,
  input: AssociationInput,
  idempotencyKey?: string
): Promise<Connection> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<Connection>(`${BASE_PATH}/${connectionUid}/associations`, input, headers);
}

export async function deleteAssociation(
  client: KobanaApiClient,
  connectionUid: string,
  input: AssociationInput
): Promise<Connection> {
  return client.delete<Connection>(`${BASE_PATH}/${connectionUid}/associations`, input);
}
