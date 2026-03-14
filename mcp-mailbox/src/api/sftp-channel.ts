import { KobanaApiClient } from './client.js';
import { SftpChannel, CreateSftpChannelInput, UpdateSftpChannelInput } from '../types/api.js';

function channelPath(entryId: string): string {
  return `/v2/mailbox/entries/${entryId}/sftp`;
}

export async function getSftpChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<SftpChannel> {
  return client.get<SftpChannel>(channelPath(entryId));
}

export async function createSftpChannel(
  client: KobanaApiClient,
  entryId: string,
  input: CreateSftpChannelInput
): Promise<SftpChannel> {
  return client.post<SftpChannel>(channelPath(entryId), { sftp_channel: input });
}

export async function updateSftpChannel(
  client: KobanaApiClient,
  entryId: string,
  input: UpdateSftpChannelInput
): Promise<SftpChannel> {
  return client.patch<SftpChannel>(channelPath(entryId), { sftp_channel: input });
}

export async function deleteSftpChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<void> {
  await client.delete(channelPath(entryId));
}

export async function activateSftpChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<SftpChannel> {
  return client.put<SftpChannel>(`${channelPath(entryId)}/activate`);
}

export async function deactivateSftpChannel(
  client: KobanaApiClient,
  entryId: string
): Promise<SftpChannel> {
  return client.put<SftpChannel>(`${channelPath(entryId)}/deactivate`);
}

export async function fetchSftpFiles(
  client: KobanaApiClient,
  entryId: string
): Promise<SftpChannel> {
  return client.put<SftpChannel>(`${channelPath(entryId)}/fetch`);
}

export async function updateSftpCredentials(
  client: KobanaApiClient,
  entryId: string
): Promise<SftpChannel> {
  return client.put<SftpChannel>(`${channelPath(entryId)}/update_password`);
}
