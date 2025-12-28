import { z } from 'zod';

// Pagination Schemas

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().describe('Page number (default: 1)'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page (default: 50, max: 50)'),
});

// Common Schemas

export const beneficiarySchema = z.object({
  document_number: z.string().describe('CPF or CNPJ of the beneficiary'),
  name: z.string().describe('Full name or company name of the beneficiary'),
});

export const bankAccountSchema = z.object({
  compe_number: z.number().int().optional().describe('COMPE bank code'),
  ispb_number: z.number().int().optional().describe('ISPB bank code'),
  agency_number: z.string().describe('Agency number'),
  agency_digit: z.string().optional().describe('Agency digit'),
  account_number: z.string().describe('Account number'),
  account_digit: z.string().optional().describe('Account digit'),
  document_number: z.string().optional().describe('CPF/CNPJ of the account holder'),
});

export const internalAccountSchema = z.object({
  agency_number: z.string().describe('Agency number'),
  agency_digit: z.string().optional().describe('Agency digit'),
  account_number: z.string().describe('Account number'),
  account_digit: z.string().optional().describe('Account digit'),
});

// Transfer Batch Schemas

export const listTransferBatchesSchema = paginationSchema.extend({
  status: z.string().optional().describe('Filter by status (pending, awaiting_approval, confirmed, reproved, approved, rejected)'),
  registration_status: z.string().optional().describe('Filter by registration status (pending, requested, confirmed, rejected, failed)'),
  financial_account_uid: z.string().optional().describe('Filter by financial account UID'),
  transport_kind: z.string().optional().describe('Filter by transport kind (pix, ted, internal)'),
  created_from: z.string().optional().describe('Filter by minimum creation date (ISO 8601)'),
  created_to: z.string().optional().describe('Filter by maximum creation date (ISO 8601)'),
});

export const getTransferBatchSchema = z.object({
  uid: z.string().describe('Unique identifier of the transfer batch'),
});

export const approveTransferBatchSchema = z.object({
  uid: z.string().describe('Unique identifier of the transfer batch to approve'),
});

export const reproveTransferBatchSchema = z.object({
  uid: z.string().describe('Unique identifier of the transfer batch to reprove'),
});

// Transfer Pix Schemas

export const listTransferPixSchema = paginationSchema.extend({
  status: z.string().optional().describe('Filter by status (pending, awaiting_approval, confirmed, reproved, approved, rejected)'),
  registration_status: z.string().optional().describe('Filter by registration status (pending, requested, confirmed, rejected, failed)'),
  financial_account_uid: z.string().optional().describe('Filter by financial account UID'),
  scheduled_from: z.string().optional().describe('Filter by minimum scheduled date (ISO 8601)'),
  scheduled_to: z.string().optional().describe('Filter by maximum scheduled date (ISO 8601)'),
  confirmed_from: z.string().optional().describe('Filter by minimum confirmation date (ISO 8601)'),
  confirmed_to: z.string().optional().describe('Filter by maximum confirmation date (ISO 8601)'),
  created_from: z.string().optional().describe('Filter by minimum creation date (ISO 8601)'),
  created_to: z.string().optional().describe('Filter by maximum creation date (ISO 8601)'),
  external_id: z.string().optional().describe('Filter by external ID'),
  tags: z.string().optional().describe('Filter by tags (comma-separated)'),
});

export const createTransferPixSchema = z.object({
  amount: z.number().positive().describe('Amount to transfer (e.g., 100.50)'),
  financial_account_uid: z.string().describe('UID of the source financial account'),
  type: z.enum(['key', 'bank_account']).describe('Type of Pix transfer: key or bank_account'),
  scheduled_to: z.string().optional().describe('Scheduled date for the transfer (ISO 8601 format, e.g., 2024-12-31)'),
  transfer_purpose: z.string().optional().describe('Transfer purpose code (e.g., "98" for miscellaneous payments)'),
  external_id: z.string().optional().describe('External ID for your internal control'),
  custom_data: z.record(z.unknown()).optional().describe('Custom data as JSON object'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
  beneficiary: beneficiarySchema.optional().describe('Beneficiary information'),
  key_type: z.enum(['cnpj', 'random', 'email', 'phone', 'cpf']).optional().describe('Type of Pix key (required if type is "key")'),
  key: z.string().optional().describe('Pix key value (required if type is "key")'),
  bank_account: bankAccountSchema.optional().describe('Bank account data (required if type is "bank_account")'),
  identifier: z.string().optional().describe('Payment identifier for the financial provider receipt'),
});

export const getTransferPixSchema = z.object({
  uid: z.string().describe('Unique identifier of the Pix transfer'),
});

// Transfer TED Schemas

export const listTransferTedSchema = paginationSchema.extend({
  status: z.string().optional().describe('Filter by status (pending, awaiting_approval, confirmed, reproved, approved, rejected)'),
  registration_status: z.string().optional().describe('Filter by registration status (pending, requested, confirmed, rejected, failed)'),
  financial_account_uid: z.string().optional().describe('Filter by financial account UID'),
  scheduled_from: z.string().optional().describe('Filter by minimum scheduled date (ISO 8601)'),
  scheduled_to: z.string().optional().describe('Filter by maximum scheduled date (ISO 8601)'),
  confirmed_from: z.string().optional().describe('Filter by minimum confirmation date (ISO 8601)'),
  confirmed_to: z.string().optional().describe('Filter by maximum confirmation date (ISO 8601)'),
  created_from: z.string().optional().describe('Filter by minimum creation date (ISO 8601)'),
  created_to: z.string().optional().describe('Filter by maximum creation date (ISO 8601)'),
  external_id: z.string().optional().describe('Filter by external ID'),
  tags: z.string().optional().describe('Filter by tags (comma-separated)'),
});

export const createTransferTedSchema = z.object({
  amount: z.number().positive().describe('Amount to transfer (e.g., 100.50)'),
  financial_account_uid: z.string().describe('UID of the source financial account'),
  scheduled_to: z.string().optional().describe('Scheduled date for the transfer (ISO 8601 format, e.g., 2024-12-31)'),
  transfer_purpose: z.string().optional().describe('Transfer purpose code (e.g., "98" for miscellaneous payments)'),
  external_id: z.string().optional().describe('External ID for your internal control'),
  custom_data: z.record(z.unknown()).optional().describe('Custom data as JSON object'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
  beneficiary: beneficiarySchema.optional().describe('Beneficiary information'),
  bank_account: bankAccountSchema.describe('Bank account data for the TED transfer'),
});

export const getTransferTedSchema = z.object({
  uid: z.string().describe('Unique identifier of the TED transfer'),
});

// Transfer Internal Schemas

export const listTransferInternalSchema = paginationSchema.extend({
  status: z.string().optional().describe('Filter by status (pending, awaiting_approval, confirmed, reproved, approved, rejected)'),
  registration_status: z.string().optional().describe('Filter by registration status (pending, requested, confirmed, rejected, failed)'),
  financial_account_uid: z.string().optional().describe('Filter by financial account UID'),
  scheduled_from: z.string().optional().describe('Filter by minimum scheduled date (ISO 8601)'),
  scheduled_to: z.string().optional().describe('Filter by maximum scheduled date (ISO 8601)'),
  confirmed_from: z.string().optional().describe('Filter by minimum confirmation date (ISO 8601)'),
  confirmed_to: z.string().optional().describe('Filter by maximum confirmation date (ISO 8601)'),
  created_from: z.string().optional().describe('Filter by minimum creation date (ISO 8601)'),
  created_to: z.string().optional().describe('Filter by maximum creation date (ISO 8601)'),
  external_id: z.string().optional().describe('Filter by external ID'),
  tags: z.string().optional().describe('Filter by tags (comma-separated)'),
});

export const createTransferInternalSchema = z.object({
  amount: z.number().positive().describe('Amount to transfer (e.g., 100.50)'),
  financial_account_uid: z.string().describe('UID of the source financial account'),
  scheduled_to: z.string().optional().describe('Scheduled date for the transfer (ISO 8601 format, e.g., 2024-12-31)'),
  transfer_purpose: z.string().optional().describe('Transfer purpose code (e.g., "98" for miscellaneous payments)'),
  external_id: z.string().optional().describe('External ID for your internal control'),
  custom_data: z.record(z.unknown()).optional().describe('Custom data as JSON object'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
  beneficiary: beneficiarySchema.optional().describe('Beneficiary information'),
  internal: internalAccountSchema.describe('Internal account data for the transfer between accounts'),
});

export const getTransferInternalSchema = z.object({
  uid: z.string().describe('Unique identifier of the internal transfer'),
});

// Transfer Batch Creation Schemas

export const createTransferPixBatchSchema = z.object({
  financial_account_uid: z.string().describe('UID of the source financial account'),
  transfers: z.array(
    z.union([
      z.object({
        uid: z.string().describe('UID of an existing transfer to add to the batch'),
      }),
      z.object({
        amount: z.number().positive().describe('Amount to transfer'),
        financial_account_uid: z.string().describe('UID of the source financial account'),
        type: z.enum(['key', 'bank_account']).describe('Type of Pix transfer'),
        scheduled_to: z.string().optional().describe('Scheduled date'),
        transfer_purpose: z.string().optional().describe('Transfer purpose code'),
        external_id: z.string().optional().describe('External ID'),
        custom_data: z.record(z.unknown()).optional().describe('Custom data'),
        tags: z.array(z.string()).optional().describe('Tags'),
        beneficiary: beneficiarySchema.optional().describe('Beneficiary information'),
        key_type: z.enum(['cnpj', 'random', 'email', 'phone', 'cpf']).optional().describe('Pix key type'),
        key: z.string().optional().describe('Pix key value'),
        bank_account: bankAccountSchema.optional().describe('Bank account data'),
        identifier: z.string().optional().describe('Payment identifier'),
      }),
    ])
  ).describe('List of transfers (new or existing by UID)'),
});

export const createTransferTedBatchSchema = z.object({
  financial_account_uid: z.string().describe('UID of the source financial account'),
  transfers: z.array(
    z.union([
      z.object({
        uid: z.string().describe('UID of an existing transfer to add to the batch'),
      }),
      z.object({
        amount: z.number().positive().describe('Amount to transfer'),
        financial_account_uid: z.string().describe('UID of the source financial account'),
        scheduled_to: z.string().optional().describe('Scheduled date'),
        transfer_purpose: z.string().optional().describe('Transfer purpose code'),
        external_id: z.string().optional().describe('External ID'),
        custom_data: z.record(z.unknown()).optional().describe('Custom data'),
        tags: z.array(z.string()).optional().describe('Tags'),
        beneficiary: beneficiarySchema.optional().describe('Beneficiary information'),
        bank_account: bankAccountSchema.describe('Bank account data'),
      }),
    ])
  ).describe('List of transfers (new or existing by UID)'),
});

export const createTransferInternalBatchSchema = z.object({
  financial_account_uid: z.string().describe('UID of the source financial account'),
  transfers: z.array(
    z.union([
      z.object({
        uid: z.string().describe('UID of an existing transfer to add to the batch'),
      }),
      z.object({
        amount: z.number().positive().describe('Amount to transfer'),
        financial_account_uid: z.string().describe('UID of the source financial account'),
        scheduled_to: z.string().optional().describe('Scheduled date'),
        transfer_purpose: z.string().optional().describe('Transfer purpose code'),
        external_id: z.string().optional().describe('External ID'),
        custom_data: z.record(z.unknown()).optional().describe('Custom data'),
        tags: z.array(z.string()).optional().describe('Tags'),
        beneficiary: beneficiarySchema.optional().describe('Beneficiary information'),
        internal: internalAccountSchema.describe('Internal account data'),
      }),
    ])
  ).describe('List of transfers (new or existing by UID)'),
});
