import { KobanaApiClient } from './client.js';
import { MailboxFile, CreateMailboxFileInput, UpdateMailboxFileInput, PaginationParams } from '../types/api.js';
export declare function listMailboxFiles(client: KobanaApiClient, filters?: PaginationParams): Promise<MailboxFile[]>;
export declare function getMailboxFile(client: KobanaApiClient, uid: string): Promise<MailboxFile>;
export declare function createMailboxFile(client: KobanaApiClient, entryUid: string, input: CreateMailboxFileInput, idempotencyKey?: string): Promise<MailboxFile>;
export declare function updateMailboxFile(client: KobanaApiClient, uid: string, input: UpdateMailboxFileInput): Promise<MailboxFile>;
export declare function deleteMailboxFile(client: KobanaApiClient, uid: string): Promise<void>;
//# sourceMappingURL=files.d.ts.map