import { KobanaApiClient } from './client.js';
import { EmailChannel, CreateEmailChannelInput, UpdateEmailChannelInput } from '../types/api.js';
export declare function getEmailChannel(client: KobanaApiClient, entryId: string): Promise<EmailChannel>;
export declare function createEmailChannel(client: KobanaApiClient, entryId: string, input: CreateEmailChannelInput): Promise<EmailChannel>;
export declare function updateEmailChannel(client: KobanaApiClient, entryId: string, input: UpdateEmailChannelInput): Promise<EmailChannel>;
export declare function deleteEmailChannel(client: KobanaApiClient, entryId: string): Promise<void>;
export declare function activateEmailChannel(client: KobanaApiClient, entryId: string): Promise<EmailChannel>;
export declare function deactivateEmailChannel(client: KobanaApiClient, entryId: string): Promise<EmailChannel>;
//# sourceMappingURL=email-channel.d.ts.map