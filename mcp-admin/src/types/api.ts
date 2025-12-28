// User Types

export interface User {
  id: number;
  email: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  created_via_api?: boolean;
  created_at: string;
  updated_at?: string | null;
  permissions?: string[] | null;
}

export interface CreateUserInput {
  email: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  permissions?: string[] | null;
}

export interface UpdateUserInput {
  email?: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  permissions?: string[] | null;
}

// Subaccount Types

export interface Subaccount {
  id: number;
  uid: string;
  parent_id: number;
  email?: string;
  business_name?: string | null;
  business_cnpj?: string | null;
  nickname: string;
  business_legal_name?: string | null;
  configuration?: string | null;
  api_access_token?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  created_via_api?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CreateSubaccountInput {
  nickname: string;
  email?: string;
  business_name?: string | null;
  business_cnpj?: string | null;
  business_legal_name?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
}

export interface UpdateSubaccountInput {
  nickname?: string;
  email?: string;
  business_cnpj?: string | null;
  business_legal_name?: string | null;
  account_type?: 'individual' | 'juridical';
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  gender?: string | null;
  cpf?: string | null;
  address_street_name?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city_name?: string | null;
  address_state?: string | null;
  address_zipcode?: string | null;
  phone_number?: string | null;
  mobile_number?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
}

// Certificate Types

export interface Certificate {
  id?: number;
  uid: string;
  account_id: number;
  label?: string | null;
  subaccounts?: boolean | null;
  common_name?: string | null;
  issuer?: string | null;
  cnpj_cpf: string;
  created_via_api?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  expiration_date?: string | null;
  status: 'draft' | 'validated' | 'expired';
  created_by: 'user' | 'system';
}

export interface CreateCertificateInput {
  label: string;
  cnpj_cpf: string;
  subaccounts?: boolean | null;
  type: 'crt' | 'pfx';
  files: {
    crt_file?: string;
    crt_private_key_file?: string;
    pfx_file?: string;
    pfx_password?: string;
  };
}

// Connection Types

export interface ConnectionAssociation {
  resource: {
    slug: 'charge.bank_billet_account' | 'charge.pix_account';
    uid: string;
  };
}

export interface Connection {
  uid: string;
  label?: string | null;
  provider_slug: string;
  environment: 'production' | 'homologation';
  apis: string[];
  credentials: Record<string, unknown>;
  certificate_uid?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  enabled_at?: string | null;
  validated_at?: string | null;
  associations?: ConnectionAssociation[];
}

export interface CreateConnectionInput {
  label?: string | null;
  provider_slug: string;
  environment?: 'production' | 'homologation';
  enabled?: boolean | null;
  apis?: string[];
  credentials: Record<string, unknown>;
  certificate_uid?: string | null;
  associations?: ConnectionAssociation[];
}

export interface UpdateConnectionInput {
  label?: string | null;
  environment?: 'production' | 'homologation';
  apis?: string[];
  credentials?: Record<string, unknown>;
  certificate_uid?: string | null;
  enabled?: boolean | null;
  revalidate?: boolean | null;
}

// Association Types

export interface AssociationInput {
  resource: {
    slug: 'charge.bank_billet_account' | 'charge.pix_account';
    uid: string;
  };
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

export interface ListUsersFilters extends PaginationParams {
  email?: string;
}

export interface ListSubaccountsFilters extends PaginationParams {
  email?: string;
  business_cnpj?: string;
  created_from?: string;
  created_to?: string;
}

export interface ListCertificatesFilters extends PaginationParams {}

export interface ListConnectionsFilters extends PaginationParams {
  provider_slug?: string;
  certificate_uid?: string;
  enabled?: boolean;
  validated?: boolean;
  created_from?: string;
  created_to?: string;
}

// API Error

export interface ApiError {
  error: string;
  message?: string;
  errors?: Record<string, string[]>;
}
