// Automatic Pix Types

export interface AutomaticPixPix {
  uid: string;
  txid?: string;
  amount: number;
  paid_amount?: number;
  status: string;
  recurrence_uid?: string;
  request_uid?: string;
  payer?: {
    name: string;
    document_number: string;
  };
  expire_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomaticPixRecurrence {
  uid: string;
  name?: string;
  status: string;
  pix_account_id: string;
  amount?: number;
  frequency?: string;
  payer?: {
    name: string;
    document_number: string;
  };
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AutomaticPixRequest {
  uid: string;
  status: string;
  recurrence_uid?: string;
  payer?: {
    name: string;
    document_number: string;
  };
  amount?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAutomaticPixRecurrenceInput {
  pix_account_id: string;
  name?: string;
  amount?: number;
  frequency?: string;
  payer?: {
    name: string;
    document_number: string;
  };
  start_date?: string;
  end_date?: string;
}

export interface UpdateAutomaticPixRecurrenceInput {
  name?: string;
  amount?: number;
  frequency?: string;
  payer?: {
    name?: string;
    document_number?: string;
  };
  end_date?: string;
}

export interface CreateAutomaticPixRecurrencePixInput {
  amount?: number;
  expire_at?: string;
}

export interface CreateAutomaticPixRecurrenceRequestInput {
  amount?: number;
}

export interface UpdateAutomaticPixPixInput {
  amount?: number;
  expire_at?: string;
}

export interface PatchAutomaticPixPixInput {
  tags?: string[];
}

export interface PatchAutomaticPixRecurrenceInput {
  tags?: string[];
}

export interface PatchAutomaticPixRequestInput {
  tags?: string[];
}

// Payments Types

export interface ChargePayment {
  uid: string;
  amount: number;
  status: string;
  payment_method?: string;
  payer?: {
    name: string;
    document_number: string;
  };
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChargePaymentInput {
  amount: number;
  payment_method?: string;
  payer?: {
    name: string;
    document_number: string;
  };
}

// List Filters

export interface ListAutomaticPixPixFilters {
  page?: number;
  per_page?: number;
  status?: string;
  recurrence_uid?: string;
}

export interface ListAutomaticPixRecurrencesFilters {
  page?: number;
  per_page?: number;
  status?: string;
}

export interface ListAutomaticPixRequestsFilters {
  page?: number;
  per_page?: number;
  status?: string;
  recurrence_uid?: string;
}

export interface ListChargePaymentsFilters {
  page?: number;
  per_page?: number;
  status?: string;
}
