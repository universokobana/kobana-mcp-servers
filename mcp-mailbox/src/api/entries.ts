import { KobanaApiClient } from './client.js';
import {
  MailboxEntry,
  CreateMailboxEntryInput,
  UpdateMailboxEntryInput,
  PaginationParams,
} from '../types/api.js';

const BASE_PATH = '/v2/mailbox/entries';

export async function listMailboxEntries(
  client: KobanaApiClient,
  filters?: PaginationParams
): Promise<MailboxEntry[]> {
  return client.get<MailboxEntry[]>(BASE_PATH, filters as Record<string, unknown>);
}

export async function getMailboxEntry(
  client: KobanaApiClient,
  uid: string
): Promise<MailboxEntry> {
  return client.get<MailboxEntry>(`${BASE_PATH}/${uid}`);
}

export async function createMailboxEntry(
  client: KobanaApiClient,
  input: CreateMailboxEntryInput,
  idempotencyKey?: string
): Promise<MailboxEntry> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<MailboxEntry>(BASE_PATH, { mailbox_entry: input }, headers);
}

export async function updateMailboxEntry(
  client: KobanaApiClient,
  uid: string,
  input: UpdateMailboxEntryInput
): Promise<MailboxEntry> {
  return client.patch<MailboxEntry>(`${BASE_PATH}/${uid}`, { mailbox_entry: input });
}

export async function deleteMailboxEntry(
  client: KobanaApiClient,
  uid: string
): Promise<void> {
  await client.delete(`${BASE_PATH}/${uid}`);
}
