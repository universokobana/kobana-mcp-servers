import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as bankBilletsApi from '../api/bank-billets.js';
import {
  listBankBilletsSchema,
  createBankBilletSchema,
  getBankBilletSchema,
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

export const listPaymentBankBilletsTool: ToolDefinition = {
  name: 'list_payment_bank_billets',
  description: 'List all bank billet payments. Bank billets (boletos) are Brazilian payment slips. Supports pagination.',
  inputSchema: listBankBilletsSchema,
  handler: async (client, args) => {
    try {
      const params = listBankBilletsSchema.parse(args);
      const billets = await bankBilletsApi.listBankBillets(client, params);
      return { success: true, data: billets };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createPaymentBankBilletTool: ToolDefinition = {
  name: 'create_payment_bank_billet',
  description: 'Create a new bank billet payment. Requires the amount, financial account UID, and barcode/payment line. Optionally schedule for a future date.',
  inputSchema: createBankBilletSchema,
  handler: async (client, args) => {
    try {
      const input = createBankBilletSchema.parse(args);
      const billet = await bankBilletsApi.createBankBillet(client, input);
      return { success: true, data: billet };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getPaymentBankBilletTool: ToolDefinition = {
  name: 'get_payment_bank_billet',
  description: 'Get details of a specific bank billet payment by its unique identifier (UID).',
  inputSchema: getBankBilletSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getBankBilletSchema.parse(args);
      const billet = await bankBilletsApi.getBankBillet(client, uid);
      return { success: true, data: billet };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const bankBilletsTools: ToolDefinition[] = [
  listPaymentBankBilletsTool,
  createPaymentBankBilletTool,
  getPaymentBankBilletTool,
];
