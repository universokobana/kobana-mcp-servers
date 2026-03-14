import { KobanaApiClient } from './client.js';
import { SyncthingChannel, CreateSyncthingChannelInput, UpdateSyncthingChannelInput } from '../types/api.js';
export declare function getSyncthingChannel(client: KobanaApiClient, entryId: string): Promise<SyncthingChannel>;
export declare function createSyncthingChannel(client: KobanaApiClient, entryId: string, input: CreateSyncthingChannelInput): Promise<SyncthingChannel>;
export declare function updateSyncthingChannel(client: KobanaApiClient, entryId: string, input: UpdateSyncthingChannelInput): Promise<SyncthingChannel>;
export declare function deleteSyncthingChannel(client: KobanaApiClient, entryId: string): Promise<void>;
export declare function activateSyncthingChannel(client: KobanaApiClient, entryId: string): Promise<SyncthingChannel>;
export declare function deactivateSyncthingChannel(client: KobanaApiClient, entryId: string): Promise<SyncthingChannel>;
export declare function resendSyncthingInvites(client: KobanaApiClient, entryId: string): Promise<SyncthingChannel>;
export declare function updateSyncthingStatus(client: KobanaApiClient, entryId: string): Promise<SyncthingChannel>;
//# sourceMappingURL=syncthing-channel.d.ts.map