import { KobanaApiClient } from './client.js';
import { PixCommand, PaginationParams } from '../types/api.js';

function getBasePath(pixUid: string): string {
  return `/v2/charge/pix/${pixUid}/commands`;
}

export async function listPixCommands(
  client: KobanaApiClient,
  pixUid: string,
  params?: PaginationParams
): Promise<PixCommand[]> {
  return client.get<PixCommand[]>(getBasePath(pixUid), params as Record<string, unknown>);
}

export async function getPixCommand(
  client: KobanaApiClient,
  pixUid: string,
  commandId: string
): Promise<PixCommand> {
  return client.get<PixCommand>(`${getBasePath(pixUid)}/${commandId}`);
}
