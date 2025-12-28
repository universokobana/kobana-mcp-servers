import { KobanaApiClient } from './client.js';
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  ListUsersFilters,
} from '../types/api.js';

const BASE_PATH = '/v2/admin/users';

export async function listUsers(
  client: KobanaApiClient,
  filters?: ListUsersFilters
): Promise<User[]> {
  return client.get<User[]>(BASE_PATH, filters as Record<string, unknown>);
}

export async function createUser(
  client: KobanaApiClient,
  input: CreateUserInput,
  idempotencyKey?: string
): Promise<User> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<User>(BASE_PATH, { user: input }, headers);
}

export async function updateUser(
  client: KobanaApiClient,
  id: number,
  input: UpdateUserInput,
  idempotencyKey?: string
): Promise<User> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.put<User>(`${BASE_PATH}/${id}`, { user: input }, headers);
}

export async function deleteUser(
  client: KobanaApiClient,
  id: number
): Promise<void> {
  await client.delete<void>(`${BASE_PATH}/${id}`);
}
