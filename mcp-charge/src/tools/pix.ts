import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as pixApi from '../api/pix.js';
import {
  listPixChargesSchema,
  createPixChargeSchema,
  getPixChargeSchema,
  deletePixChargeSchema,
  updatePixChargeSchema,
  cancelPixChargeSchema,
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

export const listChargePixTool: ToolDefinition = {
  name: 'list_charge_pix',
  description: 'List all Pix charges with optional filters. Supports filtering by status, dates, payer document, tags, and more. Supports pagination.',
  inputSchema: listPixChargesSchema,
  handler: async (client, args) => {
    try {
      const filters = listPixChargesSchema.parse(args);
      const charges = await pixApi.listPixCharges(client, filters);
      return { success: true, data: charges };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createChargePixTool: ToolDefinition = {
  name: 'create_charge_pix',
  description: 'Create a new Pix charge for payment collection. Requires amount, Pix account ID, payer information, and expiration date. The QR code will be available after the charge is registered with the bank.',
  inputSchema: createPixChargeSchema,
  handler: async (client, args) => {
    try {
      const input = createPixChargeSchema.parse(args);
      const charge = await pixApi.createPixCharge(client, input);
      return { success: true, data: charge };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getChargePixTool: ToolDefinition = {
  name: 'get_charge_pix',
  description: 'Get details of a specific Pix charge by its unique identifier (UID). Returns full charge information including QR code if available.',
  inputSchema: getPixChargeSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getPixChargeSchema.parse(args);
      const charge = await pixApi.getPixCharge(client, uid);
      return { success: true, data: charge };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const deleteChargePixTool: ToolDefinition = {
  name: 'delete_charge_pix',
  description: 'Permanently delete a canceled Pix charge from the database. Only canceled charges can be deleted.',
  inputSchema: deletePixChargeSchema,
  handler: async (client, args) => {
    try {
      const { uid } = deletePixChargeSchema.parse(args);
      await pixApi.deletePixCharge(client, uid);
      return { success: true, message: 'Pix charge deleted successfully' };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateChargePixTool: ToolDefinition = {
  name: 'update_charge_pix',
  description: 'Update an existing Pix charge. This operation is asynchronous and returns a command object. You can update amount, expiration date, message, payer information, and payment conditions.',
  inputSchema: updatePixChargeSchema,
  handler: async (client, args) => {
    try {
      const { pix_uid, ...input } = updatePixChargeSchema.parse(args);
      const command = await pixApi.updatePixCharge(client, pix_uid, input);
      return { success: true, data: command };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const cancelChargePixTool: ToolDefinition = {
  name: 'cancel_charge_pix',
  description: 'Cancel a Pix charge. This operation is asynchronous and returns a command object. Only pending or registered charges can be canceled.',
  inputSchema: cancelPixChargeSchema,
  handler: async (client, args) => {
    try {
      const { pix_uid } = cancelPixChargeSchema.parse(args);
      const command = await pixApi.cancelPixCharge(client, pix_uid);
      return { success: true, data: command };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const pixTools: ToolDefinition[] = [
  listChargePixTool,
  createChargePixTool,
  getChargePixTool,
  deleteChargePixTool,
  updateChargePixTool,
  cancelChargePixTool,
];
