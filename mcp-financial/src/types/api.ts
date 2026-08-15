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
  document_number?: string;
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
  /** @deprecated superseded by hashed_content */
  hashed_id?: string;
  financial_provider_external_id?: string;
}

export interface StatementTransactionsAppliedFilters {
  occurrence_date_from?: string | null;
  occurrence_date_to?: string | null;
  kind?: 'credit' | 'debit' | null;
  amount_from?: number | null;
  amount_to?: number | null;
  amount_abs_from?: number | null;
  amount_abs_to?: number | null;
  category?: number[] | null;
  updated_since?: string | null;
  q?: string | null;
}

export interface StatementAccountMeta {
  statement_updated_at?: string | null;
  statement_sync_last_updated_at?: string | null;
  current_balance?: number | null;
  balance_updated_at?: string | null;
}

export interface StatementPagination {
  prev_url?: string | null;
  next_url?: string | null;
  page?: number;
  next_cursor?: string | null;
}

export interface ListStatementTransactionsResponse {
  status: number;
  data: StatementTransaction[];
  filters: StatementTransactionsAppliedFilters;
  meta: StatementAccountMeta;
  pagination?: StatementPagination;
}

// Statement Summary Types

export interface StatementSummaryGroup {
  month?: string | null;
  week?: string | null;
  day?: string | null;
  kind?: 'credit' | 'debit' | null;
  category?: number | null;
  category_description?: string | null;
  count: number;
  credit_total: number;
  debit_total: number;
  net_total: number;
}

export interface SummarizeStatementTransactionsResponse {
  status: number;
  data: StatementSummaryGroup[];
  filters: StatementTransactionsAppliedFilters & { group_by: string[] };
  meta: StatementAccountMeta;
}

// Statement Category Types

export interface StatementCategory {
  code: number;
  slug: string;
  kind: 'credit' | 'debit' | null;
  description: string | null;
}

// Statement Sync (async statement synchronization request) Types

export interface StatementSyncRequest {
  uid: string;
  status: 'pending' | 'processing' | 'done' | 'partial' | 'failed';
  start_at: string;
  end_at: string;
  commands_count: number;
  commands_summary: Record<string, number>;
  commands?: FinancialAccountCommand[];
  created_at?: string;
  updated_at?: string;
}

export interface SyncStatementTransactionsResponse {
  status: number;
  data: FinancialAccountCommand;
  sync: StatementSyncRequest;
}

// Financial Account Command Types

export interface FinancialAccountCommand {
  id: number;
  uid?: string;
  status: 'pending' | 'confirmed' | 'failed';
  operation: 'statement_sync';
  resource_type?: string | null;
  resource_uid?: string | null;
  financial_provider_slug?: string | null;
  params?: Record<string, unknown> | null;
  payload?: Record<string, unknown> | null;
  message?: string | null;
  error_message?: string | null;
  warning_message?: string | null;
  confirmation_via?: 'api' | 'edi' | null;
  created_at?: string;
  updated_at?: string;
  financial_account?: FinancialAccount;
}

// Import Types

export interface Import {
  uid: string;
  status: 'enqueued' | 'processed' | 'failed';
  created_at?: string;
  created_rows?: number;
  custom_data?: Record<string, unknown> | null;
  enqueued_at?: string | null;
  external_id?: string | null;
  failed_to_create_rows?: number;
  failed_to_update_rows?: number;
  finished_at?: string | null;
  import_errors?: Record<string, unknown> | null;
  processed_at?: string | null;
  processed_rows?: number;
  started_at?: string | null;
  tags?: string[];
  tag_list?: string | null;
  total_rows?: number | null;
  updated_at?: string;
  updated_rows?: number;
  source_file_name?: string;
  source_file_size?: number;
  created_via_api?: boolean | null;
}

export interface CreateImportInput {
  /** File content for import, base64 encoded. Sent to the API as a multipart file part. */
  source: string;
  /** File name to use for the uploaded part (e.g. "statement.ret"). */
  file_name?: string;
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
  date_window?: 'strict';
  occurrence_date_from?: string;
  occurrence_date_to?: string;
  kind?: 'credit' | 'debit';
  amount_from?: number;
  amount_to?: number;
  amount_abs_from?: number;
  amount_abs_to?: number;
  category?: string;
  updated_since?: string;
  q?: string;
  view?: 'compact';
  fields?: string;
  pagination?: 'keyset';
  cursor?: string;
}

export interface SummarizeStatementTransactionsFilters {
  group_by?: string;
  occurrence_date_from?: string;
  occurrence_date_to?: string;
  kind?: 'credit' | 'debit';
  category?: string;
  q?: string;
}

export interface ListStatementTransactionSyncsFilters extends PaginationParams {
  status?: 'pending' | 'processing' | 'done' | 'partial' | 'failed';
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

export interface SyncStatementTransactionsInput {
  start_at?: string;
  end_at?: string;
}

// API Error

export interface ApiError {
  error: string;
  message?: string;
  errors?: Record<string, string[]>;
}
