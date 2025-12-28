import { z } from 'zod';

// Pagination Schema

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().describe('Page number (default: 1)'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page (default: 50, max: 50)'),
});

// Bank Billet Schemas

export const createBankBilletSchema = z.object({
  amount: z.number().positive().describe('Amount in BRL (e.g., 120.99)'),
  financial_account_uid: z.string().describe('UID of the source financial account'),
  code: z.string().describe('Barcode or payment slip line (linha digitavel)'),
  scheduled_to: z.string().optional().describe('Scheduled payment date (YYYY-MM-DD format)'),
  external_id: z.string().optional().describe('External ID in your system for internal tracking'),
  custom_data: z.record(z.unknown()).optional().describe('Custom JSON data for your use'),
  tags: z.array(z.string()).optional().describe('Associated tags'),
});

export const listBankBilletsSchema = paginationSchema;

export const getBankBilletSchema = z.object({
  uid: z.string().describe('Unique identifier of the bank billet payment'),
});

// Pix Schemas

export const createPixSchema = z.object({
  financial_account_uid: z.string().describe('UID of the source financial account'),
  qrcode: z.string().describe('Pix QR Code (copia e cola)'),
  amount: z.number().positive().optional().describe('Amount in BRL. Optional for immediate or due date QR codes.'),
  scheduled_to: z.string().optional().describe('Scheduled payment date (YYYY-MM-DD format)'),
  external_id: z.string().optional().describe('External ID in your system for internal tracking'),
  custom_data: z.record(z.unknown()).optional().describe('Custom JSON data for your use'),
  tags: z.array(z.string()).optional().describe('Associated tags'),
  identifier: z.string().optional().describe('Payment identifier on the financial provider receipt (bank exclusive)'),
});

export const listPixSchema = paginationSchema;

export const getPixSchema = z.object({
  uid: z.string().describe('Unique identifier of the Pix payment'),
});

// DARF Schemas

export const createDarfSchema = z.object({
  amount: z.number().positive().describe('Amount in BRL (e.g., 120.99)'),
  financial_account_uid: z.string().describe('UID of the source financial account'),
  calculation_date: z.string().optional().describe('End date of the calculation period (YYYY-MM-DD format)'),
  expire_at: z.string().optional().describe('Due date (YYYY-MM-DD format)'),
  reference_number: z.string().optional().describe('DARF reference number'),
  taxpayer_number: z.string().optional().describe('CPF or CNPJ of the taxpayer'),
  tax_code: z.string().optional().describe('Revenue code (codigo da receita)'),
});

export const listDarfsSchema = paginationSchema;

export const getDarfSchema = z.object({
  uid: z.string().describe('Unique identifier of the DARF payment'),
});

// Tax Schemas

export const taxKindSchema = z.enum(['itbi', 'icms', 'iss', 'iptu', 'fgts', 'dare']).describe('Type of tax');

export const createTaxSchema = z.object({
  amount: z.number().positive().describe('Amount in BRL (e.g., 120.99)'),
  financial_account_uid: z.string().describe('UID of the source financial account'),
  code: z.string().describe('Barcode or payment slip line (linha digitavel) of the tax'),
  kind: taxKindSchema,
  scheduled_to: z.string().optional().describe('Scheduled payment date (YYYY-MM-DD format)'),
  external_id: z.string().optional().describe('External ID in your system for internal tracking'),
  custom_data: z.record(z.unknown()).optional().describe('Custom JSON data for your use'),
  tags: z.array(z.string()).optional().describe('Associated tags'),
});

export const listTaxesSchema = paginationSchema;

export const getTaxSchema = z.object({
  uid: z.string().describe('Unique identifier of the tax payment'),
});

// Utility Schemas

export const createUtilitySchema = z.object({
  amount: z.number().positive().describe('Amount in BRL (e.g., 120.99)'),
  financial_account_uid: z.string().describe('UID of the source financial account'),
  code: z.string().describe('Barcode or payment slip line (linha digitavel)'),
  scheduled_to: z.string().optional().describe('Scheduled payment date (YYYY-MM-DD format)'),
  external_id: z.string().optional().describe('External ID in your system for internal tracking'),
  custom_data: z.record(z.unknown()).optional().describe('Custom JSON data for your use'),
  tags: z.array(z.string()).optional().describe('Associated tags'),
});

export const listUtilitiesSchema = paginationSchema;

export const getUtilitySchema = z.object({
  uid: z.string().describe('Unique identifier of the utility payment'),
});

// Batch Schemas

export const listBatchesSchema = paginationSchema;

export const getBatchSchema = z.object({
  uid: z.string().describe('Unique identifier of the payment batch'),
});

export const approveBatchSchema = z.object({
  uid: z.string().describe('Unique identifier of the payment batch to approve'),
});

export const reproveBatchSchema = z.object({
  uid: z.string().describe('Unique identifier of the payment batch to reprove'),
});

// Bank Billet Batch Schemas

const batchBankBilletPaymentNewSchema = z.object({
  amount: z.number().positive().describe('Amount in BRL'),
  code: z.string().describe('Barcode or payment slip line'),
  scheduled_to: z.string().optional().describe('Scheduled payment date (YYYY-MM-DD format)'),
  external_id: z.string().optional().describe('External ID in your system'),
  custom_data: z.record(z.unknown()).optional().describe('Custom JSON data'),
  tags: z.array(z.string()).optional().describe('Associated tags'),
});

const batchBankBilletPaymentExistingSchema = z.object({
  uid: z.string().describe('UID of an existing payment'),
});

const batchBankBilletPaymentSchema = z.union([
  batchBankBilletPaymentNewSchema,
  batchBankBilletPaymentExistingSchema,
]);

export const createBankBilletBatchSchema = z.object({
  financial_account_uid: z.string().describe('UID of the source financial account'),
  payments: z.array(batchBankBilletPaymentSchema).min(1).describe('List of bank billet payments (new or existing)'),
});

// Pix Batch Schemas

const batchPixPaymentNewSchema = z.object({
  qrcode: z.string().describe('Pix QR Code (copia e cola)'),
  amount: z.number().positive().optional().describe('Amount in BRL'),
  scheduled_to: z.string().optional().describe('Scheduled payment date (YYYY-MM-DD format)'),
  external_id: z.string().optional().describe('External ID in your system'),
  custom_data: z.record(z.unknown()).optional().describe('Custom JSON data'),
  tags: z.array(z.string()).optional().describe('Associated tags'),
  identifier: z.string().optional().describe('Payment identifier on receipt'),
});

const batchPixPaymentExistingSchema = z.object({
  uid: z.string().describe('UID of an existing payment'),
});

const batchPixPaymentSchema = z.union([
  batchPixPaymentNewSchema,
  batchPixPaymentExistingSchema,
]);

export const createPixBatchSchema = z.object({
  financial_account_uid: z.string().describe('UID of the source financial account'),
  payments: z.array(batchPixPaymentSchema).min(1).describe('List of Pix payments (new or existing)'),
});

// DARF Batch Schemas

const batchDarfPaymentNewSchema = z.object({
  amount: z.number().positive().describe('Amount in BRL'),
  calculation_date: z.string().optional().describe('End date of calculation period'),
  expire_at: z.string().optional().describe('Due date'),
  reference_number: z.string().optional().describe('DARF reference number'),
  taxpayer_number: z.string().optional().describe('CPF or CNPJ'),
  tax_code: z.string().optional().describe('Revenue code'),
});

const batchDarfPaymentExistingSchema = z.object({
  uid: z.string().describe('UID of an existing payment'),
});

const batchDarfPaymentSchema = z.union([
  batchDarfPaymentNewSchema,
  batchDarfPaymentExistingSchema,
]);

export const createDarfBatchSchema = z.object({
  financial_account_uid: z.string().describe('UID of the source financial account'),
  payments: z.array(batchDarfPaymentSchema).min(1).describe('List of DARF payments (new or existing)'),
});

// Tax Batch Schemas

const batchTaxPaymentNewSchema = z.object({
  amount: z.number().positive().describe('Amount in BRL'),
  code: z.string().describe('Barcode or payment slip line'),
  kind: taxKindSchema,
  scheduled_to: z.string().optional().describe('Scheduled payment date (YYYY-MM-DD format)'),
  external_id: z.string().optional().describe('External ID in your system'),
  custom_data: z.record(z.unknown()).optional().describe('Custom JSON data'),
  tags: z.array(z.string()).optional().describe('Associated tags'),
});

const batchTaxPaymentExistingSchema = z.object({
  uid: z.string().describe('UID of an existing payment'),
});

const batchTaxPaymentSchema = z.union([
  batchTaxPaymentNewSchema,
  batchTaxPaymentExistingSchema,
]);

export const createTaxBatchSchema = z.object({
  financial_account_uid: z.string().describe('UID of the source financial account'),
  payments: z.array(batchTaxPaymentSchema).min(1).describe('List of tax payments (new or existing)'),
});

// Utility Batch Schemas

const batchUtilityPaymentNewSchema = z.object({
  amount: z.number().positive().describe('Amount in BRL'),
  code: z.string().describe('Barcode or payment slip line'),
  scheduled_to: z.string().optional().describe('Scheduled payment date (YYYY-MM-DD format)'),
  external_id: z.string().optional().describe('External ID in your system'),
  custom_data: z.record(z.unknown()).optional().describe('Custom JSON data'),
  tags: z.array(z.string()).optional().describe('Associated tags'),
});

const batchUtilityPaymentExistingSchema = z.object({
  uid: z.string().describe('UID of an existing payment'),
});

const batchUtilityPaymentSchema = z.union([
  batchUtilityPaymentNewSchema,
  batchUtilityPaymentExistingSchema,
]);

export const createUtilityBatchSchema = z.object({
  financial_account_uid: z.string().describe('UID of the source financial account'),
  payments: z.array(batchUtilityPaymentSchema).min(1).describe('List of utility payments (new or existing)'),
});
