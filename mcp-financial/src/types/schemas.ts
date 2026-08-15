import { z } from 'zod';

// Pagination Schemas

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().describe('Page number (default: 1)'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page (default: 50, max: 50)'),
});

// Financial Provider Schemas

export const listFinancialProvidersSchema = z.object({}).describe('List all financial providers');

// Financial Account Schemas

export const personInfoSchema = z.object({
  name: z.string().optional().describe('Name of the account holder'),
  document: z.string().optional().describe('CPF or CNPJ of the account holder'),
  email: z.string().optional().describe('Email of the account holder'),
  phone: z.string().optional().describe('Phone number of the account holder'),
});

export const createFinancialAccountSchema = z.object({
  kind: z.enum(['checking', 'savings', 'payment']).optional().describe('Account type: checking, savings, or payment'),
  account_number: z.string().describe('Account number'),
  account_digit: z.string().describe('Account digit'),
  agency_number: z.string().describe('Agency number'),
  agency_digit: z.string().optional().describe('Agency digit'),
  financial_provider_slug: z.string().describe('Financial provider identifier (e.g., "banco_do_brasil", "itau")'),
  bank_number: z.number().int().optional().describe('COMPE bank number. Required if bank_id is not provided'),
  custom_data: z.record(z.unknown()).optional().describe('Custom data as key-value JSON'),
  custom_name: z.string().optional().describe('Custom name for the financial account'),
  external_id: z.string().optional().describe('External ID in your system'),
  payment_agreement_code: z.string().optional().describe('Payment agreement code contracted with the bank'),
  person_info: personInfoSchema.optional().describe('Account holder information'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
});

export const updateFinancialAccountSchema = z.object({
  id: z.string().describe('Unique identifier of the financial account'),
  kind: z.enum(['checking', 'savings', 'payment']).optional().describe('Account type'),
  account_number: z.string().optional().describe('Account number'),
  account_digit: z.string().optional().describe('Account digit'),
  agency_number: z.string().optional().describe('Agency number'),
  agency_digit: z.string().optional().describe('Agency digit'),
  custom_data: z.record(z.unknown()).optional().describe('Custom data as key-value JSON'),
  custom_name: z.string().optional().describe('Custom name for the financial account'),
  external_id: z.string().optional().describe('External ID in your system'),
  payment_agreement_code: z.string().optional().describe('Payment agreement code'),
  person_info: personInfoSchema.optional().describe('Account holder information'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
});

export const getFinancialAccountSchema = z.object({
  id: z.string().describe('Unique identifier of the financial account'),
});

export const listFinancialAccountsSchema = paginationSchema;

// Financial Account Balance Schemas

export const createFinancialAccountBalanceSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  amount: z.number().describe('Balance amount'),
  blocked_amount: z.number().optional().describe('Blocked amount'),
  automatically_invested_amount: z.number().optional().describe('Automatically invested amount'),
  custom_data: z.record(z.unknown()).optional().describe('Custom data as key-value JSON'),
  external_id: z.string().optional().describe('External ID in your system'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
});

export const getFinancialAccountBalanceSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  balance_uid: z.string().describe('UID of the balance'),
});

export const listFinancialAccountBalancesSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  page: z.number().int().positive().optional().describe('Page number'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page'),
});

// Financial Account Command Schemas

export const listFinancialAccountCommandsSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
});

export const getFinancialAccountCommandSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  id: z.string().describe('ID of the command'),
});

// Statement Transaction Schemas

export const listStatementTransactionsSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  page: z.number().int().positive().optional().describe('Page number'),
  per_page: z.number().int().min(1).max(500).optional().describe('Items per page (default: 50, max: 500)'),
  date_window: z.enum(['strict']).optional().describe('Send "strict" to opt into the 180-day max window that becomes the default on 2027-02-05. Without it, a request with no dates still returns the full account history (until that date).'),
  occurrence_date_from: z.string().optional().describe('Filter by minimum occurrence date (ISO 8601). With date_window=strict and omitted, derived from occurrence_date_to (180 days before) or today.'),
  occurrence_date_to: z.string().optional().describe('Filter by maximum occurrence date (ISO 8601). With date_window=strict and omitted, derived from occurrence_date_from (180 days after) or today.'),
  kind: z.enum(['credit', 'debit']).optional().describe('Filter by transaction kind'),
  amount_from: z.number().optional().describe('Minimum transaction amount, signed in reais (debits are negative, matching the amount field)'),
  amount_to: z.number().optional().describe('Maximum transaction amount, signed in reais'),
  amount_abs_from: z.number().optional().describe('Minimum absolute amount, ignoring sign — use for "above X, in or out"'),
  amount_abs_to: z.number().optional().describe('Maximum absolute amount, ignoring sign'),
  category: z.string().optional().describe('Category code, or comma-separated list of codes. See GET list_financial_statement_categories. Unknown codes are ignored.'),
  updated_since: z.string().optional().describe('Return only transactions changed at or after this instant (ISO 8601 date-time). For incremental sync.'),
  q: z.string().optional().describe('Free-text search on the transaction description sent by the bank. Matches any substring, case- and accent-insensitive.'),
  view: z.enum(['compact']).optional().describe('Use "compact" to receive only the essential fields of each transaction'),
  fields: z.string().optional().describe('Comma-separated list of fields to return per transaction. Takes precedence over view. An unknown field causes a 422.'),
  pagination: z.enum(['keyset']).optional().describe('Use "keyset" for cursor-based pagination, stable when new transactions arrive mid-scan. The response then carries next_cursor instead of prev_url/next_url.'),
  cursor: z.string().optional().describe('Cursor returned in the previous response pagination.next_cursor. Only takes effect with pagination=keyset.'),
});

export const summarizeStatementTransactionsSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  group_by: z.string().optional().describe('Comma-separated grouping dimensions: day, week, month, kind, category. Default: month.'),
  occurrence_date_from: z.string().optional().describe('Start of the window (ISO 8601 date). Same derivation rule as listing, up to a 730-day span.'),
  occurrence_date_to: z.string().optional().describe('End of the window (ISO 8601 date)'),
  kind: z.enum(['credit', 'debit']).optional().describe('Same filter as the listing endpoint'),
  category: z.string().optional().describe('Same filter as the listing endpoint'),
  q: z.string().optional().describe('Same filter as the listing endpoint'),
});

export const syncStatementTransactionsSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  start_at: z.string().optional().describe('Sync window start date (ISO 8601 date). Default: first day of the current month. Cannot be more than 2 years ago.'),
  end_at: z.string().optional().describe('Sync window end date (ISO 8601 date). Default: today. Cannot be in the future.'),
});

export const listStatementTransactionSyncsSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  page: z.number().int().positive().optional().describe('Page number'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page'),
  status: z.enum(['pending', 'processing', 'done', 'partial', 'failed']).optional().describe('Filter by the aggregated sync status'),
});

export const getStatementTransactionSyncSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  uid: z.string().describe('UID of the synchronization request'),
});

// Statement Category Schemas

export const listStatementCategoriesSchema = z.object({}).describe('List the catalog of statement transaction categories, needed to use the category filter on transaction listing/summary');

// Statement Transaction Import Schemas

export const listStatementTransactionImportsSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  page: z.number().int().positive().optional().describe('Page number'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page'),
  status: z.string().optional().describe('Filter by status'),
  source_file_name: z.string().optional().describe('Filter by source file name'),
  processed_from: z.string().optional().describe('Filter by minimum processed date (ISO 8601)'),
  processed_to: z.string().optional().describe('Filter by maximum processed date (ISO 8601)'),
  created_from: z.string().optional().describe('Filter by minimum creation date (ISO 8601)'),
  created_to: z.string().optional().describe('Filter by maximum creation date (ISO 8601)'),
  tags: z.string().optional().describe('Filter by tags (comma-separated)'),
});

export const createStatementTransactionImportSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  source: z.string().describe('CNAB statement file content, base64 encoded. Sent to the API as a multipart file upload.'),
  file_name: z.string().optional().describe('File name to use for the upload (e.g. "statement.ret")'),
  custom_data: z.record(z.unknown()).optional().describe('Custom data as key-value JSON'),
  external_id: z.string().optional().describe('External ID in your system'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
});

export const getStatementTransactionImportSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  uid: z.string().describe('UID of the import'),
});
