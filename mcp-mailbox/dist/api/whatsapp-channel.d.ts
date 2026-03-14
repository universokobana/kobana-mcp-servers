import { KobanaApiClient } from './client.js';
import { WhatsAppChannel, CreateWhatsAppChannelInput, UpdateWhatsAppChannelInput } from '../types/api.js';
export declare function getWhatsAppChannel(client: KobanaApiClient, entryId: string): Promise<WhatsAppChannel>;
export declare function createWhatsAppChannel(client: KobanaApiClient, entryId: string, input: CreateWhatsAppChannelInput): Promise<WhatsAppChannel>;
export declare function updateWhatsAppChannel(client: KobanaApiClient, entryId: string, input: UpdateWhatsAppChannelInput): Promise<WhatsAppChannel>;
export declare function deleteWhatsAppChannel(client: KobanaApiClient, entryId: string): Promise<void>;
export declare function activateWhatsAppChannel(client: KobanaApiClient, entryId: string): Promise<WhatsAppChannel>;
export declare function deactivateWhatsAppChannel(client: KobanaApiClient, entryId: string): Promise<WhatsAppChannel>;
//# sourceMappingURL=whatsapp-channel.d.ts.map