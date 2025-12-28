// Financial Provider Types

export interface FinancialProvider {
  kind: 'bank' | 'ip';
  slug: string;
  name: string;
  bcb_name?: string;
  number?: string;
  number_with_digit?: string;
  created_at?: string;
  updated_at?: string;
}

// Financial Account Types

export interface PersonInfo {
  name?: string;
  document?: string;
  email?: string;
  phone?: string;
}

export interface FinancialAccount {
  uid: string;
  kind: 'checking' | 'savings' | 'payment';
  account_number: string;
  account_digit: string;
  agency_number: string;
  agency_digit?: string;
  financial_provider_slug: string;
  bank_number?: number;
  created_at?: string;
  custom_data?: Record<string, unknown>;
  custom_name?: string;
  external_id?: string;
  payment_agreement_code?: string;
  person_info?: PersonInfo;
  tags?: string[];
  updated_at?: string;
}

export interface CreateFinancialAccountInput {
  kind?: 'checking' | 'savings' | 'payment';
  account_number: string;
  account_digit: string;
  agency_number: string;
  agency_digit?: string;
  financial_provider_slug: string;
  bank_number?: number;
  custom_data?: Record<string, unknown>;
  custom_name?: string;
  external_id?: string;
  payment_agreement_code?: string;
  person_info?: PersonInfo;
  tags?: string[];
}

export interface UpdateFinancialAccountInput {
  kind?: 'checking' | 'savings' | 'payment';
  account_number?: string;
  account_digit?: string;
  agency_number?: string;
  agency_digit?: string;
  custom_data?: Record<string, unknown>;
  custom_name?: string;
  external_id?: string;
  payment_agreement_code?: string;
  person_info?: PersonInfo;
  tags?: string[];
}

// Financial Account Balance Types

export interface FinancialAccountBalance {
  uid: string;
  amount?: number;
  blocked_amount?: number;
  automatically_invested_amount?: number;
  created_at?: string;
  custom_data?: Record<string, unknown>;
  external_id?: string;
  tags?: string[];
}

export interface CreateFinancialAccountBalanceInput {
  amount: number;
  blocked_amount?: number;
  automatically_invested_amount?: number;
  custom_data?: Record<string, unknown>;
  external_id?: string;
  tags?: string[];
}

// Statement Transaction Types

export interface StatementTransactionPerson {
  name?: string;
  document?: string;
}

export interface StatementTransaction {
  id: number;
  financial_account_uid: string;
  amount: number;
  person?: StatementTransactionPerson;
  created_at?: string;
  updated_at?: string;
  occurrence_date?: string;
  description?: string;
  document_number?: string;
  kind: 'credit' | 'debit';
  category?: number;
  category_description?: string;
  hashed_content?: string;
  hashed_id?: string;
}

// Financial Account Command Types

export interface FinancialAccountCommand {
  id: number;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  operation: 'statement_sync' | 'balance_sync';
  params?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  financial_account?: FinancialAccount;
}

// Import Types

export interface Import {
  uid: string;
  status: 'enqueued' | 'processing' | 'processed' | 'failed';
  created_at?: string;
  created_rows?: number;
  custom_data?: Record<string, unknown>;
  enqueued_at?: string;
  external_id?: string;
  failed_to_create_rows?: number;
  failed_to_update_rows?: number;
  finished_at?: string;
  import_errors?: Record<string, unknown>;
  processed_at?: string;
  processed_rows?: number;
  started_at?: string;
  tags?: string[];
  total_rows?: number;
  updated_at?: string;
  updated_rows?: number;
}

export interface CreateImportInput {
  source: string;
  custom_data?: Record<string, unknown>;
  external_id?: string;
  tags?: string[];
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

// List Filters

export interface ListFinancialAccountsFilters extends PaginationParams {}

export interface ListBalancesFilters extends PaginationParams {}

export interface ListStatementTransactionsFilters extends PaginationParams {
  occurrence_date_from?: string;
  occurrence_date_to?: string;
}

export interface ListImportsFilters extends PaginationParams {
  status?: string;
  source_file_name?: string;
  processed_from?: string;
  processed_to?: string;
  created_from?: string;
  created_to?: string;
  tags?: string;
}

// API Error

export interface ApiError {
  error: string;
  message?: string;
  errors?: Record<string, string[]>;
}
