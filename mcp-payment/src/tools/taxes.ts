import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as taxesApi from '../api/taxes.js';
import {
  listTaxesSchema,
  createTaxSchema,
  getTaxSchema,
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

export const listPaymentTaxesTool: ToolDefinition = {
  name: 'list_payment_taxes',
  description: 'List all tax payments. Supports various Brazilian taxes like ITBI, ICMS, ISS, IPTU, FGTS, and DARE. Supports pagination.',
  inputSchema: listTaxesSchema,
  handler: async (client, args) => {
    try {
      const params = listTaxesSchema.parse(args);
      const taxes = await taxesApi.listTaxes(client, params);
      return { success: true, data: taxes };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createPaymentTaxTool: ToolDefinition = {
  name: 'create_payment_tax',
  description: 'Create a new tax payment. Requires the amount, financial account UID, barcode/payment line, and tax kind (itbi, icms, iss, iptu, fgts, or dare). Optionally schedule for a future date.',
  inputSchema: createTaxSchema,
  handler: async (client, args) => {
    try {
      const input = createTaxSchema.parse(args);
      const tax = await taxesApi.createTax(client, input);
      return { success: true, data: tax };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getPaymentTaxTool: ToolDefinition = {
  name: 'get_payment_tax',
  description: 'Get details of a specific tax payment by its unique identifier (UID).',
  inputSchema: getTaxSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getTaxSchema.parse(args);
      const tax = await taxesApi.getTax(client, uid);
      return { success: true, data: tax };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const taxesTools: ToolDefinition[] = [
  listPaymentTaxesTool,
  createPaymentTaxTool,
  getPaymentTaxTool,
];
