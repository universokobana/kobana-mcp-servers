import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as darfsApi from '../api/darfs.js';
import {
  listDarfsSchema,
  createDarfSchema,
  getDarfSchema,
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

export const listPaymentDarfsTool: ToolDefinition = {
  name: 'list_payment_darfs',
  description: 'List all DARF payments. DARF (Documento de Arrecadacao de Receitas Federais) is a Brazilian federal tax payment document. Supports pagination.',
  inputSchema: listDarfsSchema,
  handler: async (client, args) => {
    try {
      const params = listDarfsSchema.parse(args);
      const darfs = await darfsApi.listDarfs(client, params);
      return { success: true, data: darfs };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createPaymentDarfTool: ToolDefinition = {
  name: 'create_payment_darf',
  description: 'Create a new DARF payment. Requires the amount and financial account UID. Optionally include calculation date, due date, reference number, taxpayer number, and tax code.',
  inputSchema: createDarfSchema,
  handler: async (client, args) => {
    try {
      const input = createDarfSchema.parse(args);
      const darf = await darfsApi.createDarf(client, input);
      return { success: true, data: darf };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getPaymentDarfTool: ToolDefinition = {
  name: 'get_payment_darf',
  description: 'Get details of a specific DARF payment by its unique identifier (UID).',
  inputSchema: getDarfSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getDarfSchema.parse(args);
      const darf = await darfsApi.getDarf(client, uid);
      return { success: true, data: darf };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const darfsTools: ToolDefinition[] = [
  listPaymentDarfsTool,
  createPaymentDarfTool,
  getPaymentDarfTool,
];
