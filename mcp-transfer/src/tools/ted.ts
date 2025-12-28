import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as tedApi from '../api/ted.js';
import {
  listTransferTedSchema,
  createTransferTedSchema,
  getTransferTedSchema,
  createTransferTedBatchSchema,
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

export const listTransferTedTool: ToolDefinition = {
  name: 'list_transfer_ted',
  description: 'List all TED transfers with optional filters. Supports filtering by status, registration status, financial account, dates, external ID, and tags. Supports pagination.',
  inputSchema: listTransferTedSchema,
  handler: async (client, args) => {
    try {
      const filters = listTransferTedSchema.parse(args);
      const response = await tedApi.listTransferTed(client, filters);
      return { success: true, data: response.data, pagination: response.pagination };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createTransferTedTool: ToolDefinition = {
  name: 'create_transfer_ted',
  description: 'Create a new TED transfer. Requires amount, financial account UID, and bank account data (COMPE/ISPB, agency, account). The beneficiary information is recommended.',
  inputSchema: createTransferTedSchema,
  handler: async (client, args) => {
    try {
      const input = createTransferTedSchema.parse(args);
      const response = await tedApi.createTransferTed(client, input);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getTransferTedTool: ToolDefinition = {
  name: 'get_transfer_ted',
  description: 'Get details of a specific TED transfer by its unique identifier (UID). Returns full transfer information including status, beneficiary, bank account, and transaction details.',
  inputSchema: getTransferTedSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getTransferTedSchema.parse(args);
      const response = await tedApi.getTransferTed(client, uid);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createTransferTedBatchTool: ToolDefinition = {
  name: 'create_transfer_ted_batch',
  description: 'Create a batch of TED transfers. Allows creating multiple transfers at once or adding existing transfers to a batch by their UIDs. All transfers in a batch are processed together.',
  inputSchema: createTransferTedBatchSchema,
  handler: async (client, args) => {
    try {
      const input = createTransferTedBatchSchema.parse(args);
      const response = await tedApi.createTransferTedBatch(client, input);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const tedTools: ToolDefinition[] = [
  listTransferTedTool,
  createTransferTedTool,
  getTransferTedTool,
  createTransferTedBatchTool,
];
