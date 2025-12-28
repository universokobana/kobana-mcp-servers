// Pix Account Types

export interface PixAccountBeneficiaryAddress {
  city: string;
  state: string;
}

export interface PixAccountBeneficiary {
  document: string;
  name: string;
  address: PixAccountBeneficiaryAddress;
}

export interface PixAccount {
  uid: string;
  custom_name: string;
  financial_provider_slug: string;
  key: string;
  key_type: string;
  status: 'pending' | 'active' | 'failed' | 'deleted';
  beneficiary: PixAccountBeneficiary;
  created_at: string;
  updated_at: string;
}

export interface CreatePixAccountInput {
  custom_name?: string;
  financial_provider_slug: string;
  key: string;
  beneficiary: {
    document: string;
    name: string;
    address: {
      city: string;
      state: string;
    };
  };
}

export interface UpdatePixAccountInput {
  custom_name?: string;
}

// Pix Charge Types

export interface PixPayer {
  name: string;
  document_number: string;
}

export interface PixInterest {
  type: 'daily_percentage' | 'daily_value' | 'monthly_percentage';
  value: number;
}

export interface PixDiscount {
  type: 'fixed' | 'percentage';
  value: number;
  limit_date: string;
}

export interface PixFine {
  type: 'fixed' | 'percentage';
  value: number;
}

export interface PixReduction {
  type: 'fixed' | 'percentage';
  value: number;
}

export interface PixCharge {
  uid: string;
  txid: string;
  amount: number;
  paid_amount?: number;
  status: 'pending' | 'registered' | 'paid' | 'canceled' | 'expired' | 'deleted';
  pix_account_id: string;
  payer: PixPayer;
  expire_at: string;
  paid_at?: string;
  message?: string;
  tags?: string[];
  qrcode?: string;
  qrcode_text?: string;
  pix_key?: string;
  interest?: PixInterest;
  discounts?: PixDiscount[];
  fine?: PixFine;
  reduction?: PixReduction;
  created_at: string;
  updated_at: string;
}

export interface CreatePixChargeInput {
  amount: number;
  pix_account_id: string;
  payer: {
    name: string;
    document_number: string;
  };
  expire_at: string;
  message?: string;
  tags?: string[];
  interest?: PixInterest;
  discounts?: PixDiscount[];
  fine?: PixFine;
  reduction?: PixReduction;
}

export interface UpdatePixChargeInput {
  amount?: number;
  expire_at?: string;
  message?: string;
  payer?: {
    name?: string;
    document_number?: string;
  };
  interest?: PixInterest;
  discounts?: PixDiscount[];
  fine?: PixFine;
  reduction?: PixReduction;
}

// Pix Command Types

export interface PixCommand {
  id: string;
  type: 'create' | 'update' | 'cancel';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  pix?: PixCharge;
  error?: string;
  created_at: string;
  updated_at: string;
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

export interface ListPixChargesFilters extends PaginationParams {
  txid?: string;
  status?: string;
  pix_account_id?: string;
  expire_from?: string;
  expire_to?: string;
  paid_from?: string;
  paid_to?: string;
  created_from?: string;
  created_to?: string;
  cnpj_cpf?: string;
  tags?: string;
}

// API Error

export interface ApiError {
  error: string;
  message?: string;
  errors?: Record<string, string[]>;
}
