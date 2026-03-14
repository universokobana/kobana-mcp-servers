// Mailbox Entry Types

export interface MailboxEntry {
  uid: string;
  slug?: string;
  name: string;
  kind: 'document' | 'import_export' | 'edi_cnab';
  send_encrypted?: boolean;
  receive_encrypted?: boolean;
  active_channels?: string[];
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
  created_via_api?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMailboxEntryInput {
  name: string;
  kind: 'document' | 'import_export' | 'edi_cnab';
  slug?: string;
  send_encrypted?: boolean;
  send_encryption_public_key?: string;
  receive_encrypted?: boolean;
  receive_encryption_keypair_id?: string;
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateMailboxEntryInput {
  name?: string;
  kind?: 'document' | 'import_export' | 'edi_cnab';
  slug?: string;
  send_encrypted?: boolean;
  send_encryption_public_key?: string;
  receive_encrypted?: boolean;
  receive_encryption_keypair_id?: string;
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
}

// Mailbox File Types

export interface MailboxFile {
  uid: string;
  mailbox_entry_id?: string;
  kind?: 'received' | 'sent';
  name: string;
  size?: number;
  mime_type?: string;
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
  created_via_api?: boolean;
  uploaded_at?: string;
  processed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMailboxFileInput {
  name: string;
  content_base64?: string;
  content_filename?: string;
  content_type?: string;
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateMailboxFileInput {
  name?: string;
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
}

// Email Channel Types

export interface EmailAddress {
  address: string;
  label?: string;
}

export interface EmailChannel {
  uid: string;
  mailbox_entry?: Record<string, unknown>;
  status?: string;
  inbox_emails?: EmailAddress[];
  outbox_emails?: EmailAddress[];
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
  created_via_api?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEmailChannelInput {
  inbox_emails?: EmailAddress[];
  outbox_emails?: EmailAddress[];
}

export interface UpdateEmailChannelInput {
  inbox_emails?: EmailAddress[];
  outbox_emails?: EmailAddress[];
}

// S3 Channel Types

export interface S3Connection {
  identity_pool_id?: string;
  user_pool_id?: string;
  client_id?: string;
  username?: string;
  region?: string;
  bucket?: string;
  inbox_path?: string;
  outbox_path?: string;
}

export interface S3Channel {
  uid: string;
  mailbox_entry?: Record<string, unknown>;
  status?: string;
  connection?: S3Connection;
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
  created_via_api?: boolean;
  created_at?: string;
  updated_at?: string;
}

// SFTP Channel Types

export interface SftpChannel {
  uid: string;
  mailbox_entry?: Record<string, unknown>;
  status?: string;
  username?: string;
  host?: string;
  port?: number;
  inbox_path?: string;
  outbox_path?: string;
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
  created_via_api?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSftpChannelInput {
  username?: string;
  host?: string;
  port?: number;
  key?: string;
  inbox_path?: string;
  outbox_path?: string;
}

export interface UpdateSftpChannelInput {
  username?: string;
  key?: string;
}

// WhatsApp Channel Types

export interface WhatsAppPhone {
  country_code: string;
  local_code: string;
  number: string;
  complete?: string;
}

export interface WhatsAppChannel {
  uid: string;
  mailbox_entry?: Record<string, unknown>;
  status?: string;
  inbox_phones?: WhatsAppPhone[];
  outbox_phones?: WhatsAppPhone[];
  activation_token?: string;
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
  created_via_api?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWhatsAppChannelInput {
  inbox_phones?: WhatsAppPhone[];
  outbox_phones?: WhatsAppPhone[];
}

export interface UpdateWhatsAppChannelInput {
  inbox_phones?: WhatsAppPhone[];
  outbox_phones?: WhatsAppPhone[];
}

// Syncthing Channel Types

export interface SyncthingChannel {
  uid: string;
  mailbox_entry?: Record<string, unknown>;
  status?: string;
  name?: string;
  device_id?: string;
  inbox_folder_id?: string;
  outbox_folder_id?: string;
  server_status?: 'connected' | 'disconnected' | 'updating' | 'error';
  error_message?: string;
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
  created_via_api?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSyncthingChannelInput {
  name?: string;
  device_id?: string;
  inbox_folder_id?: string;
  outbox_folder_id?: string;
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateSyncthingChannelInput {
  name?: string;
  device_id?: string;
}

// Pagination Types

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

// API Error

export interface ApiError {
  error: string;
  message?: string;
  errors?: Record<string, string[]>;
}
