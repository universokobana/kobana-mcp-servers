import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as paymentsApi from '../api/payments.js';
import {
  listChargePaymentsSchema,
  createChargePaymentSchema,
  getChargePaymentSchema,
  deleteChargePaymentSchema,
} from '../types/automatic-pix-schemas.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  handler: (client: KobanaApiClient, args: unknown) => Promise<unknown>;
}

function formatError(error: unknown): { error: string; details?: unknown } {
  if (error instanceof KobanaApiError) {
    return { error: error.message, details: error.toJSON() };
  }
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: 'Unknown error occurred' };
}

export const listChargePaymentsTool: ToolDefinition = {
  name: 'list_charge_payments',
  description: 'List all charge payments. Supports filtering by status.',
  inputSchema: listChargePaymentsSchema,
  handler: async (client, args) => {
    try {
      const filters = listChargePaymentsSchema.parse(args);
      const result = await paymentsApi.listChargePayments(client, filters);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createChargePaymentTool: ToolDefinition = {
  name: 'create_charge_payment',
  description: 'Create a new charge payment.',
  inputSchema: createChargePaymentSchema,
  handler: async (client, args) => {
    try {
      const input = createChargePaymentSchema.parse(args);
      const result = await paymentsApi.createChargePayment(client, input);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getChargePaymentTool: ToolDefinition = {
  name: 'get_charge_payment',
  description: 'Get details of a specific charge payment.',
  inputSchema: getChargePaymentSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getChargePaymentSchema.parse(args);
      const result = await paymentsApi.getChargePayment(client, uid);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const deleteChargePaymentTool: ToolDefinition = {
  name: 'delete_charge_payment',
  description: 'Delete a charge payment.',
  inputSchema: deleteChargePaymentSchema,
  handler: async (client, args) => {
    try {
      const { uid } = deleteChargePaymentSchema.parse(args);
      await paymentsApi.deleteChargePayment(client, uid);
      return { success: true, message: 'Payment deleted successfully' };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const paymentsTools: ToolDefinition[] = [
  listChargePaymentsTool,
  createChargePaymentTool,
  getChargePaymentTool,
  deleteChargePaymentTool,
];
