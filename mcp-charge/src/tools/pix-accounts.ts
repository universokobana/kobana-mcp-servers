import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as pixAccountsApi from '../api/pix-accounts.js';
import {
  listPixAccountsSchema,
  createPixAccountSchema,
  getPixAccountSchema,
  updatePixAccountSchema,
  deletePixAccountSchema,
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

export const listChargePixAccountsTool: ToolDefinition = {
  name: 'list_charge_pix_accounts',
  description: 'List all Pix accounts registered for receiving payments. Supports pagination.',
  inputSchema: listPixAccountsSchema,
  handler: async (client, args) => {
    try {
      const params = listPixAccountsSchema.parse(args);
      const accounts = await pixAccountsApi.listPixAccounts(client, params);
      return { success: true, data: accounts };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createChargePixAccountTool: ToolDefinition = {
  name: 'create_charge_pix_account',
  description: 'Create a new Pix account for receiving payments. Requires financial provider, Pix key, and beneficiary information.',
  inputSchema: createPixAccountSchema,
  handler: async (client, args) => {
    try {
      const input = createPixAccountSchema.parse(args);
      const account = await pixAccountsApi.createPixAccount(client, input);
      return { success: true, data: account };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getChargePixAccountTool: ToolDefinition = {
  name: 'get_charge_pix_account',
  description: 'Get details of a specific Pix account by its unique identifier (UID).',
  inputSchema: getPixAccountSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getPixAccountSchema.parse(args);
      const account = await pixAccountsApi.getPixAccount(client, uid);
      return { success: true, data: account };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateChargePixAccountTool: ToolDefinition = {
  name: 'update_charge_pix_account',
  description: 'Update an existing Pix account. Currently only the custom name can be updated.',
  inputSchema: updatePixAccountSchema,
  handler: async (client, args) => {
    try {
      const { uid, ...input } = updatePixAccountSchema.parse(args);
      const account = await pixAccountsApi.updatePixAccount(client, uid, input);
      return { success: true, data: account };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const deleteChargePixAccountTool: ToolDefinition = {
  name: 'delete_charge_pix_account',
  description: 'Delete a Pix account. The account will be marked for deletion.',
  inputSchema: deletePixAccountSchema,
  handler: async (client, args) => {
    try {
      const { uid } = deletePixAccountSchema.parse(args);
      const result = await pixAccountsApi.deletePixAccount(client, uid);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const pixAccountsTools: ToolDefinition[] = [
  listChargePixAccountsTool,
  createChargePixAccountTool,
  getChargePixAccountTool,
  updateChargePixAccountTool,
  deleteChargePixAccountTool,
];
