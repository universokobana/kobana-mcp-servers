// Bank Billet Query Types

export interface BankBilletQueryParty {
  name: string;
  kind?: 'natural' | 'juridical';
  document_type?: 'CPF' | 'CNPJ';
  document_number: string;
}

export interface BankBilletQueryFine {
  value?: number;
  amount?: number;
  percentage?: number;
}

export interface BankBilletQueryInterest {
  value?: number;
  amount?: number;
  percentage?: number;
  daily_rate?: number;
}

export interface BankBilletQueryDiscount {
  value?: number;
  amount?: number;
  percentage?: number;
}

export interface BankBilletQuery {
  uid: string;
  line: string;
  barcode: string;
  expire_at: string | null;
  amount: number | null;
  minimum_amount: number | null;
  maximum_amount: number | null;
  original_amount: number | null;
  beneficiary: BankBilletQueryParty | null;
  guarantor: BankBilletQueryParty | null;
  guarantor_drawer: BankBilletQueryParty | null;
  payer: BankBilletQueryParty | null;
  fine: BankBilletQueryFine | null;
  interest: BankBilletQueryInterest | null;
  discount: BankBilletQueryDiscount | null;
  status: 'pending' | 'success' | 'error';
  tags: string[];
  custom_data: Record<string, unknown> | null;
  created_via_api: boolean;
  external_id: string | null;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBankBilletQueryInput {
  line_or_barcode: string;
  external_id?: string;
  custom_data?: Record<string, unknown>;
  tags?: string[];
}

// Pagination Types

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface Pagination {
  prev_url: string | null;
  next_url: string | null;
  page: number;
  total_pages?: number | null;
  total_count?: number | null;
}

export interface PaginatedResponse<T> {
  status: number;
  data: T[];
  pagination: Pagination;
}

export interface SingleResponse<T> {
  status: number;
  data: T;
}

// List Filters

export interface ListBankBilletQueriesFilters extends PaginationParams {
  status?: string;
  external_id?: string;
  tags?: string;
  created_from?: string;
  created_to?: string;
}

// API Error

export interface ApiError {
  error: string;
  message?: string;
  errors?: Record<string, string[]>;
  status?: number;
}
