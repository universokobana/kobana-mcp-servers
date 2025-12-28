// Transfer Purpose
export interface TransferPurpose {
  code: string;
  description: string;
}

// Beneficiary
export interface Beneficiary {
  document_number: string;
  name: string;
}

// Bank Account
export interface BankAccount {
  compe_number?: number;
  ispb_number?: number;
  agency_number: string;
  agency_digit?: string;
  account_number: string;
  account_digit?: string;
  document_number?: string;
}

// Internal Account (for internal transfers)
export interface InternalAccount {
  agency_number: string;
  agency_digit?: string;
  account_number: string;
  account_digit?: string;
}

// Pix Target
export interface PixTarget {
  pix_type: 'key' | 'bank_account';
  txid?: string | null;
  key?: string | null;
  key_type?: 'cnpj' | 'random' | 'email' | 'phone' | 'cpf' | null;
  end_to_end_id?: string | null;
  expire_at?: string | null;
}

// Transfer Target
export interface TransferTarget {
  transfer_kind: 'pix' | 'ted' | 'internal';
  beneficiary: Beneficiary;
  bank_account?: BankAccount | null;
  internal?: InternalAccount | null;
  pix?: PixTarget | null;
}

// Transfer Status
export type TransferStatus = 'pending' | 'awaiting_approval' | 'confirmed' | 'reproved' | 'approved' | 'rejected';
export type RegistrationStatus = 'pending' | 'requested' | 'confirmed' | 'rejected' | 'failed';

// Transfer
export interface Transfer {
  uid: string;
  status: TransferStatus;
  registration_status: RegistrationStatus;
  transfer_purpose?: TransferPurpose | null;
  financial_account_uid: string;
  amount: number;
  scheduled_to?: string | null;
  confirmed_at?: string | null;
  rejected_at?: string | null;
  rejected_error?: string | null;
  transaction_code?: string | null;
  transaction_date?: string | null;
  source?: string | null;
  target: TransferTarget;
  identifier?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
}

// Transfer Batch
export interface TransferBatch {
  uid: string;
  status: TransferStatus;
  registration_status: RegistrationStatus;
  financial_account_uid: string;
  transport_kind: 'pix' | 'ted' | 'internal';
  transfers: Transfer[];
  created_at: string;
  updated_at: string;
}

// Create Transfer Pix Input
export interface CreateTransferPixInput {
  amount: number;
  financial_account_uid: string;
  type: 'key' | 'bank_account';
  scheduled_to?: string | null;
  transfer_purpose?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  beneficiary?: {
    document_number: string;
    name: string;
  };
  key_type?: 'cnpj' | 'random' | 'email' | 'phone' | 'cpf';
  key?: string;
  bank_account?: BankAccount;
  identifier?: string | null;
}

// Create Transfer TED Input
export interface CreateTransferTedInput {
  amount: number;
  financial_account_uid: string;
  scheduled_to?: string | null;
  transfer_purpose?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  beneficiary?: {
    document_number: string;
    name: string;
  };
  bank_account: BankAccount;
}

// Create Transfer Internal Input
export interface CreateTransferInternalInput {
  amount: number;
  financial_account_uid: string;
  scheduled_to?: string | null;
  transfer_purpose?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  beneficiary?: {
    document_number: string;
    name: string;
  };
  internal: InternalAccount;
}

// Create Transfer Batch Pix Input
export interface CreateTransferBatchPixInput {
  financial_account_uid: string;
  transfers: (CreateTransferPixInput | { uid: string })[];
}

// Create Transfer Batch TED Input
export interface CreateTransferBatchTedInput {
  financial_account_uid: string;
  transfers: (CreateTransferTedInput | { uid: string })[];
}

// Create Transfer Batch Internal Input
export interface CreateTransferBatchInternalInput {
  financial_account_uid: string;
  transfers: (CreateTransferInternalInput | { uid: string })[];
}

// Pagination
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface Pagination {
  prev_url?: string | null;
  next_url?: string | null;
  page: number;
  total_pages?: number | null;
  total_count?: number | null;
}

// List Filters
export interface ListTransfersFilters extends PaginationParams {
  status?: string;
  registration_status?: string;
  financial_account_uid?: string;
  scheduled_from?: string;
  scheduled_to?: string;
  confirmed_from?: string;
  confirmed_to?: string;
  created_from?: string;
  created_to?: string;
  external_id?: string;
  tags?: string;
}

export interface ListBatchesFilters extends PaginationParams {
  status?: string;
  registration_status?: string;
  financial_account_uid?: string;
  transport_kind?: string;
  created_from?: string;
  created_to?: string;
}

// API Response
export interface ApiResponse<T> {
  status: number;
  data: T;
  pagination?: Pagination;
}

// API Error
export interface ApiError {
  error: string;
  message?: string;
  errors?: Array<{
    title?: string | null;
    code?: string | null;
    param?: string | null;
    detail?: string | null;
  }>;
}
