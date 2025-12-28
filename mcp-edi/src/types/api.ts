// EDI Box Types

export interface EdiBoxResource {
  type: 'charge.bank_billet_account' | 'financial.account';
  uid: string;
}

export interface EdiBoxAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  state: string;
  city_name: string;
  zip_code: string;
}

export interface EdiBoxEmail {
  label: string | null;
  address: string;
}

export interface EdiBoxPhone {
  kind: string | null;
  country_code: string;
  local_code: string;
  number: string;
}

export interface EdiBoxPerson {
  name: string;
  kind?: 'natural' | 'juridical';
  document_type?: 'CPF' | 'CNPJ';
  document_number?: string;
  addresses?: EdiBoxAddress[];
  emails?: EdiBoxEmail[];
  phones?: EdiBoxPhone[];
  external_code?: string;
  tags?: string[];
  tag_list?: string;
  custom_data?: Record<string, unknown>;
}

export interface EdiBox {
  uid: string;
  name: string | null;
  resource: EdiBoxResource;
  account_owner: EdiBoxPerson;
  letter_owner: EdiBoxPerson | null;
  bank_manager: EdiBoxPerson | null;
  kind: 'cnab400' | 'cnab240' | 'cnab200';
  operation: 'charge' | 'statement' | 'payment';
  created_at: string;
  updated_at: string;
  validated_at: string | null;
  enabled_at: string | null;
  letter_status: 'not_created' | 'creating' | 'created';
  status: 'generated' | 'demand_received' | 'confirming_at_bank' | 'testing_by_customer' | 'waiting_for_validations' | 'activated' | null;
  letter_pdf: string | null;
}

export interface CreateEdiBoxAccountOwnerInput {
  name: string;
  document_number: string;
  phone_number: string;
  email: string;
}

export interface CreateEdiBoxBankManagerInput {
  name: string;
  phone_number: string;
  email: string;
}

export interface CreateEdiBoxLetterOwnerInput {
  name: string;
  phone_number: string;
  email: string;
}

export interface CreateEdiBoxInput {
  resource: {
    type: 'charge.bank_billet_account' | 'financial.account';
    uid: string;
  };
  name?: string;
  operation?: 'charge' | 'statement' | 'payment';
  kind?: 'cnab400' | 'cnab240' | 'cnab200';
  account_owner: CreateEdiBoxAccountOwnerInput;
  bank_manager?: CreateEdiBoxBankManagerInput;
  letter_owner: CreateEdiBoxLetterOwnerInput;
  business_logo?: string;
}

export interface UpdateEdiBoxInput {
  resource?: {
    type: 'charge.bank_billet_account' | 'financial.account';
    uid: string;
  };
  name?: string;
  operation?: 'charge' | 'statement' | 'payment';
  kind?: 'cnab400' | 'cnab240' | 'cnab200';
  account_owner?: CreateEdiBoxAccountOwnerInput;
  bank_manager?: CreateEdiBoxBankManagerInput;
  letter_owner?: CreateEdiBoxLetterOwnerInput;
  business_logo?: string;
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

export interface ListEdiBoxesFilters extends PaginationParams {
  resource_type?: string;
}

// API Error

export interface ApiError {
  error: string;
  message?: string;
  errors?: Array<{
    title?: string;
    code?: string;
    param?: string;
    detail?: string;
  }>;
}
