import { KobanaApiClient } from './client.js';
import { S3Channel } from '../types/api.js';

function channelPath(entryId: string): string {
  return `/v2/mailbox/entries/${entryId}/s3`;
}

export async function getS3Channel(
  client: KobanaApiClient,
  entryId: string
): Promise<S3Channel> {
  return client.get<S3Channel>(channelPath(entryId));
}

export async function createS3Channel(
  client: KobanaApiClient,
  entryId: string
): Promise<S3Channel> {
  return client.post<S3Channel>(channelPath(entryId), {});
}

export async function deleteS3Channel(
  client: KobanaApiClient,
  entryId: string
): Promise<void> {
  await client.delete(channelPath(entryId));
}

export async function activateS3Channel(
  client: KobanaApiClient,
  entryId: string
): Promise<S3Channel> {
  return client.put<S3Channel>(`${channelPath(entryId)}/activate`);
}

export async function deactivateS3Channel(
  client: KobanaApiClient,
  entryId: string
): Promise<S3Channel> {
  return client.put<S3Channel>(`${channelPath(entryId)}/deactivate`);
}

export async function updateS3Credentials(
  client: KobanaApiClient,
  entryId: string
): Promise<S3Channel> {
  return client.put<S3Channel>(`${channelPath(entryId)}/update_password`);
}
