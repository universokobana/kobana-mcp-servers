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
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page'),
  occurrence_date_from: z.string().optional().describe('Filter by minimum occurrence date (ISO 8601)'),
  occurrence_date_to: z.string().optional().describe('Filter by maximum occurrence date (ISO 8601)'),
});

export const syncStatementTransactionsSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
});

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
  source: z.string().describe('File content for import (base64 encoded)'),
  custom_data: z.record(z.unknown()).optional().describe('Custom data as key-value JSON'),
  external_id: z.string().optional().describe('External ID in your system'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
});

export const getStatementTransactionImportSchema = z.object({
  financial_account_uid: z.string().describe('UID of the financial account'),
  uid: z.string().describe('UID of the import'),
});
