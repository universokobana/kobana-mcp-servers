import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as pixApi from '../api/pix.js';
import {
  listTransferPixSchema,
  createTransferPixSchema,
  getTransferPixSchema,
  createTransferPixBatchSchema,
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

export const listTransferPixTool: ToolDefinition = {
  name: 'list_transfer_pix',
  description: 'List all Pix transfers with optional filters. Supports filtering by status, registration status, financial account, dates, external ID, and tags. Supports pagination.',
  inputSchema: listTransferPixSchema,
  handler: async (client, args) => {
    try {
      const filters = listTransferPixSchema.parse(args);
      const response = await pixApi.listTransferPix(client, filters);
      return { success: true, data: response.data, pagination: response.pagination };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createTransferPixTool: ToolDefinition = {
  name: 'create_transfer_pix',
  description: 'Create a new Pix transfer. Requires amount, financial account UID, and either a Pix key (with key_type and key) or bank account data. The beneficiary information is recommended.',
  inputSchema: createTransferPixSchema,
  handler: async (client, args) => {
    try {
      const input = createTransferPixSchema.parse(args);
      const response = await pixApi.createTransferPix(client, input);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getTransferPixTool: ToolDefinition = {
  name: 'get_transfer_pix',
  description: 'Get details of a specific Pix transfer by its unique identifier (UID). Returns full transfer information including status, beneficiary, and transaction details.',
  inputSchema: getTransferPixSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getTransferPixSchema.parse(args);
      const response = await pixApi.getTransferPix(client, uid);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createTransferPixBatchTool: ToolDefinition = {
  name: 'create_transfer_pix_batch',
  description: 'Create a batch of Pix transfers. Allows creating multiple transfers at once or adding existing transfers to a batch by their UIDs. All transfers in a batch are processed together.',
  inputSchema: createTransferPixBatchSchema,
  handler: async (client, args) => {
    try {
      const input = createTransferPixBatchSchema.parse(args);
      const response = await pixApi.createTransferPixBatch(client, input);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const pixTools: ToolDefinition[] = [
  listTransferPixTool,
  createTransferPixTool,
  getTransferPixTool,
  createTransferPixBatchTool,
];
