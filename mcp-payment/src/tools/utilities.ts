import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as utilitiesApi from '../api/utilities.js';
import {
  listUtilitiesSchema,
  createUtilitySchema,
  getUtilitySchema,
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

export const listPaymentUtilitiesTool: ToolDefinition = {
  name: 'list_payment_utilities',
  description: 'List all utility bill payments. Utilities include electricity, water, gas, phone, and other consumption bills. Supports pagination.',
  inputSchema: listUtilitiesSchema,
  handler: async (client, args) => {
    try {
      const params = listUtilitiesSchema.parse(args);
      const utilities = await utilitiesApi.listUtilities(client, params);
      return { success: true, data: utilities };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createPaymentUtilityTool: ToolDefinition = {
  name: 'create_payment_utility',
  description: 'Create a new utility bill payment. Requires the amount, financial account UID, and barcode/payment line. Optionally schedule for a future date.',
  inputSchema: createUtilitySchema,
  handler: async (client, args) => {
    try {
      const input = createUtilitySchema.parse(args);
      const utility = await utilitiesApi.createUtility(client, input);
      return { success: true, data: utility };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getPaymentUtilityTool: ToolDefinition = {
  name: 'get_payment_utility',
  description: 'Get details of a specific utility bill payment by its unique identifier (UID).',
  inputSchema: getUtilitySchema,
  handler: async (client, args) => {
    try {
      const { uid } = getUtilitySchema.parse(args);
      const utility = await utilitiesApi.getUtility(client, uid);
      return { success: true, data: utility };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const utilitiesTools: ToolDefinition[] = [
  listPaymentUtilitiesTool,
  createPaymentUtilityTool,
  getPaymentUtilityTool,
];
