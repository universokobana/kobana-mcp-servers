import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as pixApi from '../api/pix.js';
import {
  listPixSchema,
  createPixSchema,
  getPixSchema,
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

export const listPaymentPixTool: ToolDefinition = {
  name: 'list_payment_pix',
  description: 'List all Pix payments. Pix is the Brazilian instant payment system. Supports pagination.',
  inputSchema: listPixSchema,
  handler: async (client, args) => {
    try {
      const params = listPixSchema.parse(args);
      const payments = await pixApi.listPix(client, params);
      return { success: true, data: payments };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createPaymentPixTool: ToolDefinition = {
  name: 'create_payment_pix',
  description: 'Create a new Pix payment. Requires the financial account UID and QR code (copia e cola). Amount is optional for immediate or due date QR codes.',
  inputSchema: createPixSchema,
  handler: async (client, args) => {
    try {
      const input = createPixSchema.parse(args);
      const payment = await pixApi.createPix(client, input);
      return { success: true, data: payment };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getPaymentPixTool: ToolDefinition = {
  name: 'get_payment_pix',
  description: 'Get details of a specific Pix payment by its unique identifier (UID).',
  inputSchema: getPixSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getPixSchema.parse(args);
      const payment = await pixApi.getPix(client, uid);
      return { success: true, data: payment };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const pixTools: ToolDefinition[] = [
  listPaymentPixTool,
  createPaymentPixTool,
  getPaymentPixTool,
];
