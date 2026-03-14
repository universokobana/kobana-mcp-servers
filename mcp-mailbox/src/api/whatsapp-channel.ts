import { KobanaApiClient } from './client.js';
import { WhatsAppChannel, CreateWhatsAppChannelInput, UpdateWhatsAppChannelInput } from '../types/api.js';

function channelPath(entryId: string): string {
  return `/v2/mailbox/entries/${entryId}/whatsapp`;
}

export async function getWhatsAppChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<WhatsAppChannel> {
  return client.get<WhatsAppChannel>(channelPath(entryId));
}

export async function createWhatsAppChannel(
  client: KobanaApiClient,
  entryId: string,
  input: CreateWhatsAppChannelInput
): Promise<WhatsAppChannel> {
  return client.post<WhatsAppChannel>(channelPath(entryId), { whatsapp_channel: input });
}

export async function updateWhatsAppChannel(
  client: KobanaApiClient,
  entryId: string,
  input: UpdateWhatsAppChannelInput
): Promise<WhatsAppChannel> {
  return client.patch<WhatsAppChannel>(channelPath(entryId), { whatsapp_channel: input });
}

export async function deleteWhatsAppChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<void> {
  await client.delete(channelPath(entryId));
}

export async function activateWhatsAppChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<WhatsAppChannel> {
  return client.put<WhatsAppChannel>(`${channelPath(entryId)}/activate`);
}

export async function deactivateWhatsAppChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<WhatsAppChannel> {
  return client.put<WhatsAppChannel>(`${channelPath(entryId)}/deactivate`);
}
