import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as batchesApi from '../api/batches.js';
import {
  listTransferBatchesSchema,
  getTransferBatchSchema,
  approveTransferBatchSchema,
  reproveTransferBatchSchema,
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

export const listTransferBatchesTool: ToolDefinition = {
  name: 'list_transfer_batches',
  description: 'List all transfer batches with optional filters. Supports filtering by status, registration status, financial account, transport kind, and creation dates. Supports pagination.',
  inputSchema: listTransferBatchesSchema,
  handler: async (client, args) => {
    try {
      const filters = listTransferBatchesSchema.parse(args);
      const response = await batchesApi.listTransferBatches(client, filters);
      return { success: true, data: response.data, pagination: response.pagination };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getTransferBatchTool: ToolDefinition = {
  name: 'get_transfer_batch',
  description: 'Get details of a specific transfer batch by its unique identifier (UID). Returns the batch information including all transfers in the batch.',
  inputSchema: getTransferBatchSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getTransferBatchSchema.parse(args);
      const response = await batchesApi.getTransferBatch(client, uid);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const approveTransferBatchTool: ToolDefinition = {
  name: 'approve_transfer_batch',
  description: 'Approve a transfer batch that is awaiting approval. This will allow the transfers in the batch to be processed.',
  inputSchema: approveTransferBatchSchema,
  handler: async (client, args) => {
    try {
      const { uid } = approveTransferBatchSchema.parse(args);
      const response = await batchesApi.approveTransferBatch(client, uid);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const reproveTransferBatchTool: ToolDefinition = {
  name: 'reprove_transfer_batch',
  description: 'Reprove (reject) a transfer batch that is awaiting approval. This will prevent the transfers in the batch from being processed.',
  inputSchema: reproveTransferBatchSchema,
  handler: async (client, args) => {
    try {
      const { uid } = reproveTransferBatchSchema.parse(args);
      const response = await batchesApi.reproveTransferBatch(client, uid);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const batchesTools: ToolDefinition[] = [
  listTransferBatchesTool,
  getTransferBatchTool,
  approveTransferBatchTool,
  reproveTransferBatchTool,
];
