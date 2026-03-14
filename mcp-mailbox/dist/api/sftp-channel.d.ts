import { KobanaApiClient } from './client.js';
import { SftpChannel, CreateSftpChannelInput, UpdateSftpChannelInput } from '../types/api.js';
export declare function getSftpChannel(client: KobanaApiClient, entryId: string): Promise<SftpChannel>;
export declare function createSftpChannel(client: KobanaApiClient, entryId: string, input: CreateSftpChannelInput): Promise<SftpChannel>;
export declare function updateSftpChannel(client: KobanaApiClient, entryId: string, input: UpdateSftpChannelInput): Promise<SftpChannel>;
export declare function deleteSftpChannel(client: KobanaApiClient, entryId: string): Promise<void>;
export declare function activateSftpChannel(client: KobanaApiClient, entryId: string): Promise<SftpChannel>;
export declare function deactivateSftpChannel(client: KobanaApiClient, entryId: string): Promise<SftpChannel>;
export declare function fetchSftpFiles(client: KobanaApiClient, entryId: string): Promise<SftpChannel>;
export declare function updateSftpCredentials(client: KobanaApiClient, entryId: string): Promise<SftpChannel>;
//# sourceMappingURL=sftp-channel.d.ts.map