import { z } from 'zod';

// Pagination Schemas

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().describe('Page number (default: 1)'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page (default: 50, max: 50)'),
});

// Pix Account Schemas

export const pixAccountBeneficiaryAddressSchema = z.object({
  city: z.string().describe('City name'),
  state: z.string().length(2).describe('State code (2 letters, e.g., SP, RJ)'),
});

export const pixAccountBeneficiarySchema = z.object({
  document: z.string().describe('CPF or CNPJ of the beneficiary'),
  name: z.string().describe('Legal name of the beneficiary'),
  address: pixAccountBeneficiaryAddressSchema,
});

export const createPixAccountSchema = z.object({
  custom_name: z.string().optional().describe('Custom name for the Pix account'),
  financial_provider_slug: z.string().describe('Financial provider identifier (e.g., "banco_do_brasil", "itau")'),
  key: z.string().describe('Pix key (CPF, CNPJ, email, phone, or EVP)'),
  beneficiary: pixAccountBeneficiarySchema,
});

export const updatePixAccountSchema = z.object({
  uid: z.string().describe('Unique identifier of the Pix account'),
  custom_name: z.string().optional().describe('New custom name for the Pix account'),
});

export const getPixAccountSchema = z.object({
  uid: z.string().describe('Unique identifier of the Pix account'),
});

export const deletePixAccountSchema = z.object({
  uid: z.string().describe('Unique identifier of the Pix account'),
});

export const listPixAccountsSchema = paginationSchema;

// Pix Charge Schemas

export const pixPayerSchema = z.object({
  name: z.string().describe('Name of the payer'),
  document_number: z.string().describe('CPF or CNPJ of the payer'),
});

export const pixInterestSchema = z.object({
  type: z.enum(['daily_percentage', 'daily_value', 'monthly_percentage']).describe('Type of interest calculation'),
  value: z.number().positive().describe('Interest value'),
});

export const pixDiscountSchema = z.object({
  type: z.enum(['fixed', 'percentage']).describe('Type of discount'),
  value: z.number().positive().describe('Discount value'),
  limit_date: z.string().describe('Limit date for the discount (ISO 8601 format)'),
});

export const pixFineSchema = z.object({
  type: z.enum(['fixed', 'percentage']).describe('Type of fine'),
  value: z.number().positive().describe('Fine value'),
});

export const pixReductionSchema = z.object({
  type: z.enum(['fixed', 'percentage']).describe('Type of reduction'),
  value: z.number().positive().describe('Reduction value'),
});

export const createPixChargeSchema = z.object({
  amount: z.number().positive().describe('Amount in cents (e.g., 1000 = R$ 10,00)'),
  pix_account_id: z.string().describe('UID of the Pix account to receive the payment'),
  payer: pixPayerSchema,
  expire_at: z.string().describe('Expiration date (ISO 8601 format, e.g., 2024-12-31T23:59:59Z)'),
  message: z.string().optional().describe('Message to display to the payer'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
  interest: pixInterestSchema.optional().describe('Interest configuration for late payment'),
  discounts: z.array(pixDiscountSchema).optional().describe('Discount configurations'),
  fine: pixFineSchema.optional().describe('Fine configuration for late payment'),
  reduction: pixReductionSchema.optional().describe('Reduction configuration'),
});

export const updatePixChargeSchema = z.object({
  pix_uid: z.string().describe('Unique identifier of the Pix charge'),
  amount: z.number().positive().optional().describe('New amount in cents'),
  expire_at: z.string().optional().describe('New expiration date (ISO 8601 format)'),
  message: z.string().optional().describe('New message to display to the payer'),
  payer: z.object({
    name: z.string().optional().describe('New name of the payer'),
    document_number: z.string().optional().describe('New CPF or CNPJ of the payer'),
  }).optional().describe('Updated payer information'),
  interest: pixInterestSchema.optional().describe('New interest configuration'),
  discounts: z.array(pixDiscountSchema).optional().describe('New discount configurations'),
  fine: pixFineSchema.optional().describe('New fine configuration'),
  reduction: pixReductionSchema.optional().describe('New reduction configuration'),
});

export const getPixChargeSchema = z.object({
  uid: z.string().describe('Unique identifier of the Pix charge'),
});

export const deletePixChargeSchema = z.object({
  uid: z.string().describe('Unique identifier of the Pix charge'),
});

export const cancelPixChargeSchema = z.object({
  pix_uid: z.string().describe('Unique identifier of the Pix charge'),
});

export const listPixChargesSchema = paginationSchema.extend({
  txid: z.string().optional().describe('Filter by transaction ID'),
  status: z.string().optional().describe('Filter by status (pending, registered, paid, canceled, expired)'),
  pix_account_id: z.string().optional().describe('Filter by Pix account UID'),
  expire_from: z.string().optional().describe('Filter by minimum expiration date (ISO 8601)'),
  expire_to: z.string().optional().describe('Filter by maximum expiration date (ISO 8601)'),
  paid_from: z.string().optional().describe('Filter by minimum payment date (ISO 8601)'),
  paid_to: z.string().optional().describe('Filter by maximum payment date (ISO 8601)'),
  created_from: z.string().optional().describe('Filter by minimum creation date (ISO 8601)'),
  created_to: z.string().optional().describe('Filter by maximum creation date (ISO 8601)'),
  cnpj_cpf: z.string().optional().describe('Filter by payer document (CPF or CNPJ)'),
  tags: z.string().optional().describe('Filter by tags (comma-separated)'),
});

// Pix Commands Schemas

export const listPixCommandsSchema = z.object({
  pix_uid: z.string().describe('Unique identifier of the Pix charge'),
  page: z.number().int().positive().optional().describe('Page number'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page'),
});

export const getPixCommandSchema = z.object({
  pix_uid: z.string().describe('Unique identifier of the Pix charge'),
  id: z.string().describe('Unique identifier of the command'),
});
