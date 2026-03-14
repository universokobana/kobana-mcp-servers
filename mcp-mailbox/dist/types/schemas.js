import { z } from 'zod';
// Pagination Schemas
export const paginationSchema = z.object({
    page: z.number().int().positive().optional().describe('Page number (default: 1)'),
    per_page: z.number().int().min(1).max(50).optional().describe('Items per page (default: 50, max: 50)'),
});
// Mailbox Entry Schemas
export const listMailboxEntriesSchema = paginationSchema;
export const getMailboxEntrySchema = z.object({
    uid: z.string().describe('UID of the mailbox entry'),
});
export const createMailboxEntrySchema = z.object({
    name: z.string().describe('Display name of the mailbox entry'),
    kind: z.enum(['document', 'import_export', 'edi_cnab']).describe('Type of mailbox: document, import_export, or edi_cnab'),
    slug: z.string().optional().describe('User-friendly unique identifier'),
    send_encrypted: z.boolean().optional().describe('Whether uploaded files should be encrypted'),
    send_encryption_public_key: z.string().optional().describe('PEM public key for encryption'),
    receive_encrypted: z.boolean().optional().describe('Whether received files are encrypted'),
    receive_encryption_keypair_id: z.string().optional().describe('UID of keypair for decryption'),
    external_id: z.string().optional().describe('External integration identifier'),
    custom_data: z.record(z.unknown()).optional().describe('Custom data as key-value JSON'),
    tags: z.array(z.string()).optional().describe('Tags for categorization'),
});
export const updateMailboxEntrySchema = z.object({
    uid: z.string().describe('UID of the mailbox entry to update'),
    name: z.string().optional().describe('Display name of the mailbox entry'),
    kind: z.enum(['document', 'import_export', 'edi_cnab']).optional().describe('Type of mailbox'),
    slug: z.string().optional().describe('User-friendly unique identifier'),
    send_encrypted: z.boolean().optional().describe('Whether uploaded files should be encrypted'),
    send_encryption_public_key: z.string().optional().describe('PEM public key for encryption'),
    receive_encrypted: z.boolean().optional().describe('Whether received files are encrypted'),
    receive_encryption_keypair_id: z.string().optional().describe('UID of keypair for decryption'),
    external_id: z.string().optional().describe('External integration identifier'),
    custom_data: z.record(z.unknown()).optional().describe('Custom data as key-value JSON'),
    tags: z.array(z.string()).optional().describe('Tags for categorization'),
});
export const deleteMailboxEntrySchema = z.object({
    uid: z.string().describe('UID of the mailbox entry to delete'),
});
// Mailbox File Schemas
export const listMailboxFilesSchema = paginationSchema;
export const getMailboxFileSchema = z.object({
    uid: z.string().describe('UID of the mailbox file'),
});
export const createMailboxFileSchema = z.object({
    entry_uid: z.string().describe('UID of the mailbox entry to upload the file to'),
    name: z.string().describe('File name (e.g., "remessa.txt")'),
    content_base64: z.string().optional().describe('File content encoded in Base64'),
    content_filename: z.string().optional().describe('Original filename for the Base64 content'),
    content_type: z.string().optional().describe('MIME type (e.g., "text/plain")'),
    external_id: z.string().optional().describe('External integration identifier'),
    custom_data: z.record(z.unknown()).optional().describe('Custom data as key-value JSON'),
    tags: z.array(z.string()).optional().describe('Tags for categorization'),
});
export const updateMailboxFileSchema = z.object({
    uid: z.string().describe('UID of the mailbox file to update'),
    name: z.string().optional().describe('File name'),
    external_id: z.string().optional().describe('External integration identifier'),
    custom_data: z.record(z.unknown()).optional().describe('Custom data as key-value JSON'),
    tags: z.array(z.string()).optional().describe('Tags for categorization'),
});
export const deleteMailboxFileSchema = z.object({
    uid: z.string().describe('UID of the mailbox file to delete'),
});
// Email Channel Schemas
const emailAddressSchema = z.object({
    address: z.string().describe('Email address'),
    label: z.string().optional().describe('Label for the email address'),
});
export const getEmailChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const createEmailChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
    inbox_emails: z.array(emailAddressSchema).optional().describe('List of inbox email addresses'),
    outbox_emails: z.array(emailAddressSchema).optional().describe('List of outbox email addresses'),
});
export const updateEmailChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
    inbox_emails: z.array(emailAddressSchema).optional().describe('List of inbox email addresses'),
    outbox_emails: z.array(emailAddressSchema).optional().describe('List of outbox email addresses'),
});
export const deleteEmailChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const activateEmailChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const deactivateEmailChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
// S3 Channel Schemas
export const getS3ChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const createS3ChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const deleteS3ChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const activateS3ChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const deactivateS3ChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const updateS3CredentialsSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
// SFTP Channel Schemas
export const getSftpChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const createSftpChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
    username: z.string().optional().describe('SFTP username'),
    host: z.string().optional().describe('SFTP server address'),
    port: z.number().int().optional().describe('SFTP server port'),
    key: z.string().optional().describe('SSH private key (write-only, never returned in responses)'),
    inbox_path: z.string().optional().describe('Incoming files folder path'),
    outbox_path: z.string().optional().describe('Outgoing files folder path'),
});
export const updateSftpChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
    username: z.string().optional().describe('SFTP username'),
    key: z.string().optional().describe('SSH private key (write-only)'),
});
export const deleteSftpChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const activateSftpChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const deactivateSftpChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const fetchSftpFilesSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const updateSftpCredentialsSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
// WhatsApp Channel Schemas
const whatsappPhoneSchema = z.object({
    country_code: z.string().describe('Country code (e.g., "55" for Brazil)'),
    local_code: z.string().describe('Local area code (e.g., "11")'),
    number: z.string().describe('Phone number'),
});
export const getWhatsAppChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const createWhatsAppChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
    inbox_phones: z.array(whatsappPhoneSchema).optional().describe('List of inbox phone numbers'),
    outbox_phones: z.array(whatsappPhoneSchema).optional().describe('List of outbox phone numbers'),
});
export const updateWhatsAppChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
    inbox_phones: z.array(whatsappPhoneSchema).optional().describe('List of inbox phone numbers'),
    outbox_phones: z.array(whatsappPhoneSchema).optional().describe('List of outbox phone numbers'),
});
export const deleteWhatsAppChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const activateWhatsAppChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const deactivateWhatsAppChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
// Syncthing Channel Schemas
export const getSyncthingChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const createSyncthingChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
    name: z.string().optional().describe('Syncthing device name'),
    device_id: z.string().optional().describe('Syncthing device identifier'),
    inbox_folder_id: z.string().optional().describe('Incoming folder ID'),
    outbox_folder_id: z.string().optional().describe('Outgoing folder ID'),
    external_id: z.string().optional().describe('External integration identifier'),
    custom_data: z.record(z.unknown()).optional().describe('Custom data as key-value JSON'),
    tags: z.array(z.string()).optional().describe('Tags for categorization'),
});
export const updateSyncthingChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
    name: z.string().optional().describe('Syncthing device name'),
    device_id: z.string().optional().describe('Syncthing device identifier'),
});
export const deleteSyncthingChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const activateSyncthingChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const deactivateSyncthingChannelSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const resendSyncthingInvitesSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
export const updateSyncthingStatusSchema = z.object({
    entry_id: z.string().describe('UID of the mailbox entry'),
});
//# sourceMappingURL=schemas.js.map