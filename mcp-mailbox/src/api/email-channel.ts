import { KobanaApiClient } from './client.js';
import { EmailChannel, CreateEmailChannelInput, UpdateEmailChannelInput } from '../types/api.js';

function channelPath(entryId: string): string {
  return `/v2/mailbox/entries/${entryId}/email`;
}

export async function getEmailChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<EmailChannel> {
  return client.get<EmailChannel>(channelPath(entryId));
}

export async function createEmailChannel(
  client: KobanaApiClient,
  entryId: string,
  input: CreateEmailChannelInput
): Promise<EmailChannel> {
  return client.post<EmailChannel>(channelPath(entryId), { email_channel: input });
}

export async function updateEmailChannel(
  client: KobanaApiClient,
  entryId: string,
  input: UpdateEmailChannelInput
): Promise<EmailChannel> {
  return client.patch<EmailChannel>(channelPath(entryId), { email_channel: input });
}

export async function deleteEmailChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<void> {
  await client.delete(channelPath(entryId));
}

export async function activateEmailChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<EmailChannel> {
  return client.put<EmailChannel>(`${channelPath(entryId)}/activate`);
}

export async function deactivateEmailChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<EmailChannel> {
  return client.put<EmailChannel>(`${channelPath(entryId)}/deactivate`);
}
