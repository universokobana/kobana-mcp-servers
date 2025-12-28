// Common Types

export interface Beneficiary {
  document_number?: string | null;
  name?: string | null;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface ApiError {
  error: string;
  message?: string;
  errors?: Record<string, string[]>;
}

// Payment Status Types

export type PaymentStatus =
  | 'pending'
  | 'rejected'
  | 'approved'
  | 'reproved'
  | 'failed'
  | 'confirmed'
  | 'canceled'
  | 'awaiting_approval'
  | 'scheduled'
  | 'awaiting_scheduled_date'
  | 'overdue';

export type RegistrationStatus =
  | 'pending'
  | 'requested'
  | 'confirmed'
  | 'rejected'
  | 'failed';

export type PaymentSource = 'api' | 'dda' | 'view';

export type BatchStatus =
  | 'pending'
  | 'awaiting_approval'
  | 'confirmed'
  | 'approved'
  | 'reproved'
  | 'rejected'
  | 'scheduled';

// Bank Billet Payment Types

export interface BankBilletData {
  code: string;
  beneficiary?: Beneficiary;
}

export interface PaymentBankBillet {
  uid: string;
  amount: number;
  scheduled_to?: string | null;
  status: PaymentStatus;
  registration_status: RegistrationStatus;
  confirmed_at?: string | null;
  rejected_at?: string | null;
  rejected_error?: string | null;
  transaction_code?: string | null;
  transaction_date?: string | null;
  financial_account_uid: string;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  source?: PaymentSource | null;
  bank_billet: BankBilletData;
  identifier?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBankBilletInput {
  amount: number;
  financial_account_uid: string;
  code: string;
  scheduled_to?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
}

// Pix Payment Types

export interface PixData {
  qrcode: string;
  beneficiary?: Beneficiary;
}

export interface PaymentPix {
  uid: string;
  amount: number;
  scheduled_to?: string | null;
  status: PaymentStatus;
  registration_status: RegistrationStatus;
  confirmed_at?: string | null;
  rejected_at?: string | null;
  rejected_error?: string | null;
  transaction_code?: string | null;
  transaction_date?: string | null;
  financial_account_uid: string;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  source?: PaymentSource | null;
  pix: PixData;
  identifier?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePixInput {
  financial_account_uid: string;
  qrcode: string;
  amount?: number | null;
  scheduled_to?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  identifier?: string | null;
}

// DARF Payment Types

export interface DarfData {
  calculation_date?: string | null;
  expire_at?: string | null;
  reference_number?: string | null;
  taxpayer_number?: string | null;
  tax_code?: string | null;
}

export interface PaymentDarf {
  uid: string;
  amount: number;
  scheduled_to?: string | null;
  status: PaymentStatus;
  registration_status: RegistrationStatus;
  confirmed_at?: string | null;
  rejected_at?: string | null;
  rejected_error?: string | null;
  transaction_code?: string | null;
  transaction_date?: string | null;
  financial_account_uid: string;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  source?: PaymentSource | null;
  darf: DarfData;
  identifier?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDarfInput {
  amount: number;
  financial_account_uid: string;
  calculation_date?: string | null;
  expire_at?: string | null;
  reference_number?: string | null;
  taxpayer_number?: string | null;
  tax_code?: string | null;
}

// Tax Payment Types

export type TaxKind = 'itbi' | 'icms' | 'iss' | 'iptu' | 'fgts' | 'dare';

export interface TaxData {
  code: string;
  kind: TaxKind;
  beneficiary?: Beneficiary;
}

export interface PaymentTax {
  uid: string;
  amount: number;
  scheduled_to?: string | null;
  status: PaymentStatus;
  registration_status: RegistrationStatus;
  confirmed_at?: string | null;
  rejected_at?: string | null;
  rejected_error?: string | null;
  transaction_code?: string | null;
  transaction_date?: string | null;
  financial_account_uid: string;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  source?: PaymentSource | null;
  tax: TaxData;
  identifier?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaxInput {
  amount: number;
  financial_account_uid: string;
  code: string;
  kind: TaxKind;
  scheduled_to?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
}

// Utility Payment Types

export interface UtilityData {
  code: string;
  beneficiary?: Beneficiary;
}

export interface PaymentUtility {
  uid: string;
  amount: number;
  scheduled_to?: string | null;
  status: PaymentStatus;
  registration_status: RegistrationStatus;
  confirmed_at?: string | null;
  rejected_at?: string | null;
  rejected_error?: string | null;
  transaction_code?: string | null;
  transaction_date?: string | null;
  financial_account_uid: string;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  source?: PaymentSource | null;
  utility: UtilityData;
  identifier?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUtilityInput {
  amount: number;
  financial_account_uid: string;
  code: string;
  scheduled_to?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
}

// Batch Types

export interface PaymentBatch {
  uid: string;
  status: BatchStatus;
  registration_status: RegistrationStatus;
  payments: (PaymentBankBillet | PaymentPix | PaymentDarf | PaymentTax | PaymentUtility)[];
  financial_account_uid: string;
  created_at: string;
  updated_at: string;
}

// Batch Input Types - Bank Billet

export interface BatchBankBilletPaymentNew {
  amount: number;
  code: string;
  scheduled_to?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
}

export interface BatchBankBilletPaymentExisting {
  uid: string;
}

export type BatchBankBilletPayment = BatchBankBilletPaymentNew | BatchBankBilletPaymentExisting;

export interface CreateBankBilletBatchInput {
  financial_account_uid: string;
  payments: BatchBankBilletPayment[];
}

// Batch Input Types - Pix

export interface BatchPixPaymentNew {
  amount?: number | null;
  qrcode: string;
  scheduled_to?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
  identifier?: string | null;
}

export interface BatchPixPaymentExisting {
  uid: string;
}

export type BatchPixPayment = BatchPixPaymentNew | BatchPixPaymentExisting;

export interface CreatePixBatchInput {
  financial_account_uid: string;
  payments: BatchPixPayment[];
}

// Batch Input Types - DARF

export interface BatchDarfPaymentNew {
  amount: number;
  calculation_date?: string | null;
  expire_at?: string | null;
  reference_number?: string | null;
  taxpayer_number?: string | null;
  tax_code?: string | null;
}

export interface BatchDarfPaymentExisting {
  uid: string;
}

export type BatchDarfPayment = BatchDarfPaymentNew | BatchDarfPaymentExisting;

export interface CreateDarfBatchInput {
  financial_account_uid: string;
  payments: BatchDarfPayment[];
}

// Batch Input Types - Tax

export interface BatchTaxPaymentNew {
  amount: number;
  code: string;
  kind: TaxKind;
  scheduled_to?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
}

export interface BatchTaxPaymentExisting {
  uid: string;
}

export type BatchTaxPayment = BatchTaxPaymentNew | BatchTaxPaymentExisting;

export interface CreateTaxBatchInput {
  financial_account_uid: string;
  payments: BatchTaxPayment[];
}

// Batch Input Types - Utility

export interface BatchUtilityPaymentNew {
  amount: number;
  code: string;
  scheduled_to?: string | null;
  external_id?: string | null;
  custom_data?: Record<string, unknown> | null;
  tags?: string[] | null;
}

export interface BatchUtilityPaymentExisting {
  uid: string;
}

export type BatchUtilityPayment = BatchUtilityPaymentNew | BatchUtilityPaymentExisting;

export interface CreateUtilityBatchInput {
  financial_account_uid: string;
  payments: BatchUtilityPayment[];
}
