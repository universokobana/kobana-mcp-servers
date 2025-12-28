import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as batchesApi from '../api/batches.js';
import {
  listBatchesSchema,
  getBatchSchema,
  approveBatchSchema,
  reproveBatchSchema,
  createBankBilletBatchSchema,
  createPixBatchSchema,
  createDarfBatchSchema,
  createTaxBatchSchema,
  createUtilityBatchSchema,
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

// Batch List and Get Tools

export const listPaymentBatchesTool: ToolDefinition = {
  name: 'list_payment_batches',
  description: 'List all payment batches. Batches allow grouping multiple payments for approval. Supports pagination.',
  inputSchema: listBatchesSchema,
  handler: async (client, args) => {
    try {
      const params = listBatchesSchema.parse(args);
      const batches = await batchesApi.listBatches(client, params);
      return { success: true, data: batches };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getPaymentBatchTool: ToolDefinition = {
  name: 'get_payment_batch',
  description: 'Get details of a specific payment batch by its unique identifier (UID). Returns the batch with all its payments.',
  inputSchema: getBatchSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getBatchSchema.parse(args);
      const batch = await batchesApi.getBatch(client, uid);
      return { success: true, data: batch };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

// Batch Approve and Reprove Tools

export const approvePaymentBatchTool: ToolDefinition = {
  name: 'approve_payment_batch',
  description: 'Approve a payment batch. This will proceed with the payment of all items in the batch.',
  inputSchema: approveBatchSchema,
  handler: async (client, args) => {
    try {
      const { uid } = approveBatchSchema.parse(args);
      const batch = await batchesApi.approveBatch(client, uid);
      return { success: true, data: batch };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const reprovePaymentBatchTool: ToolDefinition = {
  name: 'reprove_payment_batch',
  description: 'Reprove (reject) a payment batch. This will cancel all payments in the batch.',
  inputSchema: reproveBatchSchema,
  handler: async (client, args) => {
    try {
      const { uid } = reproveBatchSchema.parse(args);
      const batch = await batchesApi.reproveBatch(client, uid);
      return { success: true, data: batch };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

// Batch Creation Tools

export const createPaymentBankBilletBatchTool: ToolDefinition = {
  name: 'create_payment_bank_billet_batch',
  description: 'Create a batch of bank billet payments. Allows sending multiple bank billet payments at once for approval. Payments can be new or existing (by UID).',
  inputSchema: createBankBilletBatchSchema,
  handler: async (client, args) => {
    try {
      const input = createBankBilletBatchSchema.parse(args);
      const batch = await batchesApi.createBankBilletBatch(client, input);
      return { success: true, data: batch };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createPaymentPixBatchTool: ToolDefinition = {
  name: 'create_payment_pix_batch',
  description: 'Create a batch of Pix payments. Allows sending multiple Pix payments at once for approval. Payments can be new or existing (by UID).',
  inputSchema: createPixBatchSchema,
  handler: async (client, args) => {
    try {
      const input = createPixBatchSchema.parse(args);
      const batch = await batchesApi.createPixBatch(client, input);
      return { success: true, data: batch };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createPaymentDarfBatchTool: ToolDefinition = {
  name: 'create_payment_darf_batch',
  description: 'Create a batch of DARF payments. Allows sending multiple DARF (federal tax) payments at once for approval. Payments can be new or existing (by UID).',
  inputSchema: createDarfBatchSchema,
  handler: async (client, args) => {
    try {
      const input = createDarfBatchSchema.parse(args);
      const batch = await batchesApi.createDarfBatch(client, input);
      return { success: true, data: batch };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createPaymentTaxBatchTool: ToolDefinition = {
  name: 'create_payment_tax_batch',
  description: 'Create a batch of tax payments. Allows sending multiple tax payments (ITBI, ICMS, ISS, IPTU, FGTS, DARE) at once for approval. Payments can be new or existing (by UID).',
  inputSchema: createTaxBatchSchema,
  handler: async (client, args) => {
    try {
      const input = createTaxBatchSchema.parse(args);
      const batch = await batchesApi.createTaxBatch(client, input);
      return { success: true, data: batch };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createPaymentUtilityBatchTool: ToolDefinition = {
  name: 'create_payment_utility_batch',
  description: 'Create a batch of utility bill payments. Allows sending multiple utility payments at once for approval. Payments can be new or existing (by UID).',
  inputSchema: createUtilityBatchSchema,
  handler: async (client, args) => {
    try {
      const input = createUtilityBatchSchema.parse(args);
      const batch = await batchesApi.createUtilityBatch(client, input);
      return { success: true, data: batch };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const batchesTools: ToolDefinition[] = [
  listPaymentBatchesTool,
  getPaymentBatchTool,
  approvePaymentBatchTool,
  reprovePaymentBatchTool,
  createPaymentBankBilletBatchTool,
  createPaymentPixBatchTool,
  createPaymentDarfBatchTool,
  createPaymentTaxBatchTool,
  createPaymentUtilityBatchTool,
];
