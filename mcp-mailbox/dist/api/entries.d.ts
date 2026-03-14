import { KobanaApiClient } from './client.js';
import { MailboxEntry, CreateMailboxEntryInput, UpdateMailboxEntryInput, PaginationParams } from '../types/api.js';
export declare function listMailboxEntries(client: KobanaApiClient, filters?: PaginationParams): Promise<MailboxEntry[]>;
export declare function getMailboxEntry(client: KobanaApiClient, uid: string): Promise<MailboxEntry>;
export declare function createMailboxEntry(client: KobanaApiClient, input: CreateMailboxEntryInput, idempotencyKey?: string): Promise<MailboxEntry>;
export declare function updateMailboxEntry(client: KobanaApiClient, uid: string, input: UpdateMailboxEntryInput): Promise<MailboxEntry>;
export declare function deleteMailboxEntry(client: KobanaApiClient, uid: string): Promise<void>;
//# sourceMappingURL=entries.d.ts.map