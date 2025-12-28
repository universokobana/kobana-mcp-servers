import { z } from 'zod';

// Pagination
const paginationSchema = z.object({
  page: z.number().int().positive().optional().describe('Page number (default: 1)'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page (default: 50, max: 50)'),
});

// Automatic Pix - Pix Schemas

export const listAutomaticPixPixSchema = paginationSchema.extend({
  status: z.string().optional().describe('Filter by status'),
  recurrence_uid: z.string().optional().describe('Filter by recurrence UID'),
});

export const getAutomaticPixPixSchema = z.object({
  uid: z.string().describe('Unique identifier of the automatic pix'),
});

export const patchAutomaticPixPixSchema = z.object({
  uid: z.string().describe('Unique identifier of the automatic pix'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
});

export const cancelAutomaticPixPixSchema = z.object({
  uid: z.string().describe('Unique identifier of the automatic pix'),
});

export const retryAutomaticPixPixSchema = z.object({
  uid: z.string().describe('Unique identifier of the automatic pix'),
});

export const updateAutomaticPixPixSchema = z.object({
  uid: z.string().describe('Unique identifier of the automatic pix'),
  amount: z.number().positive().optional().describe('New amount in cents'),
  expire_at: z.string().optional().describe('New expiration date (ISO 8601)'),
});

// Automatic Pix - Recurrences Schemas

export const listAutomaticPixRecurrencesSchema = paginationSchema.extend({
  status: z.string().optional().describe('Filter by status'),
});

export const createAutomaticPixRecurrenceSchema = z.object({
  pix_account_id: z.string().describe('UID of the Pix account'),
  name: z.string().optional().describe('Name of the recurrence'),
  amount: z.number().positive().optional().describe('Amount in cents'),
  frequency: z.string().optional().describe('Frequency (daily, weekly, monthly, yearly)'),
  payer: z.object({
    name: z.string().describe('Payer name'),
    document_number: z.string().describe('Payer CPF or CNPJ'),
  }).optional().describe('Payer information'),
  start_date: z.string().optional().describe('Start date (ISO 8601)'),
  end_date: z.string().optional().describe('End date (ISO 8601)'),
});

export const getAutomaticPixRecurrenceSchema = z.object({
  uid: z.string().describe('Unique identifier of the recurrence'),
});

export const patchAutomaticPixRecurrenceSchema = z.object({
  uid: z.string().describe('Unique identifier of the recurrence'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
});

export const cancelAutomaticPixRecurrenceSchema = z.object({
  uid: z.string().describe('Unique identifier of the recurrence'),
});

export const updateAutomaticPixRecurrenceSchema = z.object({
  uid: z.string().describe('Unique identifier of the recurrence'),
  name: z.string().optional().describe('New name'),
  amount: z.number().positive().optional().describe('New amount in cents'),
  frequency: z.string().optional().describe('New frequency'),
  payer: z.object({
    name: z.string().optional().describe('New payer name'),
    document_number: z.string().optional().describe('New payer CPF or CNPJ'),
  }).optional().describe('Updated payer information'),
  end_date: z.string().optional().describe('New end date (ISO 8601)'),
});

export const createAutomaticPixRecurrencePixSchema = z.object({
  recurrence_uid: z.string().describe('Unique identifier of the recurrence'),
  amount: z.number().positive().optional().describe('Amount in cents'),
  expire_at: z.string().optional().describe('Expiration date (ISO 8601)'),
});

export const createAutomaticPixRecurrenceRequestSchema = z.object({
  recurrence_uid: z.string().describe('Unique identifier of the recurrence'),
  amount: z.number().positive().optional().describe('Amount in cents'),
});

// Automatic Pix - Requests Schemas

export const listAutomaticPixRequestsSchema = paginationSchema.extend({
  status: z.string().optional().describe('Filter by status'),
  recurrence_uid: z.string().optional().describe('Filter by recurrence UID'),
});

export const getAutomaticPixRequestSchema = z.object({
  uid: z.string().describe('Unique identifier of the request'),
});

export const patchAutomaticPixRequestSchema = z.object({
  uid: z.string().describe('Unique identifier of the request'),
  tags: z.array(z.string()).optional().describe('Tags for categorization'),
});

export const cancelAutomaticPixRequestSchema = z.object({
  uid: z.string().describe('Unique identifier of the request'),
});

// Charge Payments Schemas

export const listChargePaymentsSchema = paginationSchema.extend({
  status: z.string().optional().describe('Filter by status'),
});

export const createChargePaymentSchema = z.object({
  amount: z.number().positive().describe('Amount in cents'),
  payment_method: z.string().optional().describe('Payment method'),
  payer: z.object({
    name: z.string().describe('Payer name'),
    document_number: z.string().describe('Payer CPF or CNPJ'),
  }).optional().describe('Payer information'),
});

export const getChargePaymentSchema = z.object({
  uid: z.string().describe('Unique identifier of the payment'),
});

export const deleteChargePaymentSchema = z.object({
  uid: z.string().describe('Unique identifier of the payment'),
});
