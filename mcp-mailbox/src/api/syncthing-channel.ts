import { KobanaApiClient } from './client.js';
import { SyncthingChannel, CreateSyncthingChannelInput, UpdateSyncthingChannelInput } from '../types/api.js';

function channelPath(entryId: string): string {
  return `/v2/mailbox/entries/${entryId}/syncthing`;
}

export async function getSyncthingChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<SyncthingChannel> {
  return client.get<SyncthingChannel>(channelPath(entryId));
}

export async function createSyncthingChannel(
  client: KobanaApiClient,
  entryId: string,
  input: CreateSyncthingChannelInput
): Promise<SyncthingChannel> {
  return client.post<SyncthingChannel>(channelPath(entryId), { syncthing_channel: input });
}

export async function updateSyncthingChannel(
  client: KobanaApiClient,
  entryId: string,
  input: UpdateSyncthingChannelInput
): Promise<SyncthingChannel> {
  return client.patch<SyncthingChannel>(channelPath(entryId), { syncthing_channel: input });
}

export async function deleteSyncthingChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<void> {
  await client.delete(channelPath(entryId));
}

export async function activateSyncthingChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<SyncthingChannel> {
  return client.put<SyncthingChannel>(`${channelPath(entryId)}/activate`);
}

export async function deactivateSyncthingChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<SyncthingChannel> {
  return client.put<SyncthingChannel>(`${channelPath(entryId)}/deactivate`);
}

export async function resendSyncthingInvites(
  client: KobanaApiClient,
  entryId: string
): Promise<SyncthingChannel> {
  return client.put<SyncthingChannel>(`${channelPath(entryId)}/resend_invites`);
}

export async function updateSyncthingStatus(
  client: KobanaApiClient,
  entryId: string
): Promise<SyncthingChannel> {
  return client.put<SyncthingChannel>(`${channelPath(entryId)}/update_status`);
}
