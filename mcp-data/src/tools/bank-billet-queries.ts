import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as bankBilletQueriesApi from '../api/bank-billet-queries.js';
import {
  listBankBilletQueriesSchema,
  createBankBilletQuerySchema,
} from '../types/schemas.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  handler: (client: KobanaApiClient, args: unknown) => Promise<unknown>;
}

function formatError(error: unknown): { error: string; details?: unknown } {
  if (error instanceof KobanaApiError) {
    return {
      error: error.message,
      details: error.toJSON(),
    };
  }
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: 'Unknown error occurred' };
}

export const listDataBankBilletQueriesTool: ToolDefinition = {
  name: 'list_data_bank_billet_queries',
  description: 'List all bank billet queries with optional filters. Supports filtering by status, external_id, tags, and creation dates. Supports pagination. Returns detailed information about each query including amounts, beneficiary, payer, and processing status.',
  inputSchema: listBankBilletQueriesSchema,
  handler: async (client, args) => {
    try {
      const filters = listBankBilletQueriesSchema.parse(args);
      const response = await bankBilletQueriesApi.listBankBilletQueries(client, filters);
      return { success: true, data: response.data, pagination: response.pagination };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createDataBankBilletQueryTool: ToolDefinition = {
  name: 'create_data_bank_billet_query',
  description: 'Create a new bank billet query using the typeable line (linha digitavel) or barcode. The query is processed automatically and returns detailed information about the bank billet including amounts, expiration date, beneficiary, payer, fine, interest, and discount information.',
  inputSchema: createBankBilletQuerySchema,
  handler: async (client, args) => {
    try {
      const input = createBankBilletQuerySchema.parse(args);
      const response = await bankBilletQueriesApi.createBankBilletQuery(client, input);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const bankBilletQueriesTools: ToolDefinition[] = [
  listDataBankBilletQueriesTool,
  createDataBankBilletQueryTool,
];
