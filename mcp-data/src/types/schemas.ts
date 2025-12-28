import { z } from 'zod';

// Pagination Schemas

export const paginationSchema = z.object({
  page: z.number().int().positive().optional().describe('Page number (default: 1)'),
  per_page: z.number().int().min(1).max(50).optional().describe('Items per page (default: 50, max: 50)'),
});

// Bank Billet Query Schemas

export const createBankBilletQuerySchema = z.object({
  line_or_barcode: z.string().describe('Linha Digitavel (typeable line) or barcode of the bank billet. Formats: Linha Digitavel: 34191.79001 01043.510047 91020.150008 7 75870000001000, Barcode: 34197758700000010001790010104351004791020150'),
  external_id: z.string().optional().describe('External ID in your system for internal control'),
  custom_data: z.record(z.unknown()).optional().describe('Custom data as a JSON object with key-value pairs'),
  tags: z.array(z.string()).optional().describe('Tags associated with the query'),
});

export const listBankBilletQueriesSchema = paginationSchema.extend({
  status: z.string().optional().describe('Filter by status (pending, success, error)'),
  external_id: z.string().optional().describe('Filter by external ID'),
  tags: z.string().optional().describe('Filter by tags (comma-separated)'),
  created_from: z.string().optional().describe('Filter by minimum creation date (ISO 8601)'),
  created_to: z.string().optional().describe('Filter by maximum creation date (ISO 8601)'),
});
