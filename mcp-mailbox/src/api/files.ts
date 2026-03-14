import { KobanaApiClient } from './client.js';
import {
  MailboxFile,
  CreateMailboxFileInput,
  UpdateMailboxFileInput,
  PaginationParams,
} from '../types/api.js';

const BASE_PATH = '/v2/mailbox/files';
const ENTRIES_PATH = '/v2/mailbox/entries';

export async function listMailboxFiles(
  client: KobanaApiClient,
  filters?: PaginationParams
): Promise<MailboxFile[]> {
  return client.get<MailboxFile[]>(BASE_PATH, filters as Record<string, unknown>);
}

export async function getMailboxFile(
  client: KobanaApiClient,
  uid: string
): Promise<MailboxFile> {
  return client.get<MailboxFile>(`${BASE_PATH}/${uid}`);
}

export async function createMailboxFile(
  client: KobanaApiClient,
  entryUid: string,
  input: CreateMailboxFileInput,
  idempotencyKey?: string
): Promise<MailboxFile> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers['X-Idempotency-Key'] = idempotencyKey;
  }
  return client.post<MailboxFile>(
    `${ENTRIES_PATH}/${entryUid}/files`,
    { mailbox_file: input },
    headers
  );
}

export async function updateMailboxFile(
  client: KobanaApiClient,
  uid: string,
  input: UpdateMailboxFileInput
): Promise<MailboxFile> {
  return client.patch<MailboxFile>(`${BASE_PATH}/${uid}`, { mailbox_file: input });
}

export async function deleteMailboxFile(
  client: KobanaApiClient,
  uid: string
): Promise<void> {
  await client.delete(`${BASE_PATH}/${uid}`);
}
