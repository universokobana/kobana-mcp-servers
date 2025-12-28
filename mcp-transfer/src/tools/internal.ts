import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as internalApi from '../api/internal.js';
import {
  listTransferInternalSchema,
  createTransferInternalSchema,
  getTransferInternalSchema,
  createTransferInternalBatchSchema,
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

export const listTransferInternalTool: ToolDefinition = {
  name: 'list_transfer_internal',
  description: 'List all internal (between accounts) transfers with optional filters. Supports filtering by status, registration status, financial account, dates, external ID, and tags. Supports pagination.',
  inputSchema: listTransferInternalSchema,
  handler: async (client, args) => {
    try {
      const filters = listTransferInternalSchema.parse(args);
      const response = await internalApi.listTransferInternal(client, filters);
      return { success: true, data: response.data, pagination: response.pagination };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createTransferInternalTool: ToolDefinition = {
  name: 'create_transfer_internal',
  description: 'Create a new internal transfer between accounts. Requires amount, financial account UID, and internal account data (agency and account numbers). The beneficiary information is recommended.',
  inputSchema: createTransferInternalSchema,
  handler: async (client, args) => {
    try {
      const input = createTransferInternalSchema.parse(args);
      const response = await internalApi.createTransferInternal(client, input);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getTransferInternalTool: ToolDefinition = {
  name: 'get_transfer_internal',
  description: 'Get details of a specific internal transfer by its unique identifier (UID). Returns full transfer information including status, beneficiary, and transaction details.',
  inputSchema: getTransferInternalSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getTransferInternalSchema.parse(args);
      const response = await internalApi.getTransferInternal(client, uid);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createTransferInternalBatchTool: ToolDefinition = {
  name: 'create_transfer_internal_batch',
  description: 'Create a batch of internal transfers. Allows creating multiple transfers at once or adding existing transfers to a batch by their UIDs. All transfers in a batch are processed together.',
  inputSchema: createTransferInternalBatchSchema,
  handler: async (client, args) => {
    try {
      const input = createTransferInternalBatchSchema.parse(args);
      const response = await internalApi.createTransferInternalBatch(client, input);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const internalTools: ToolDefinition[] = [
  listTransferInternalTool,
  createTransferInternalTool,
  getTransferInternalTool,
  createTransferInternalBatchTool,
];
