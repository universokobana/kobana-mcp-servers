import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as subaccountsApi from '../api/subaccounts.js';
import {
  listSubaccountsSchema,
  createSubaccountSchema,
  getSubaccountSchema,
  updateSubaccountSchema,
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

export const listAdminSubaccountsTool: ToolDefinition = {
  name: 'list_admin_subaccounts',
  description: 'List all subaccounts under the main account. Subaccounts are child accounts that can have their own configurations. Supports filtering by email, CNPJ, and creation date.',
  inputSchema: listSubaccountsSchema,
  handler: async (client, args) => {
    try {
      const filters = listSubaccountsSchema.parse(args);
      const subaccounts = await subaccountsApi.listSubaccounts(client, filters);
      return { success: true, data: subaccounts };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createAdminSubaccountTool: ToolDefinition = {
  name: 'create_admin_subaccount',
  description: 'Create a new subaccount under the main account. Subaccounts can have their own billing configurations and access tokens. Requires a nickname.',
  inputSchema: createSubaccountSchema,
  handler: async (client, args) => {
    try {
      const input = createSubaccountSchema.parse(args);
      const subaccount = await subaccountsApi.createSubaccount(client, input);
      return { success: true, data: subaccount };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getAdminSubaccountTool: ToolDefinition = {
  name: 'get_admin_subaccount',
  description: 'Get detailed information about a specific subaccount by its ID.',
  inputSchema: getSubaccountSchema,
  handler: async (client, args) => {
    try {
      const { id } = getSubaccountSchema.parse(args);
      const subaccount = await subaccountsApi.getSubaccount(client, id);
      return { success: true, data: subaccount };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateAdminSubaccountTool: ToolDefinition = {
  name: 'update_admin_subaccount',
  description: 'Update an existing subaccount. Can modify business information, address, contact details, and custom data.',
  inputSchema: updateSubaccountSchema,
  handler: async (client, args) => {
    try {
      const { id, ...input } = updateSubaccountSchema.parse(args);
      const subaccount = await subaccountsApi.updateSubaccount(client, id, input);
      return { success: true, data: subaccount };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const subaccountsTools: ToolDefinition[] = [
  listAdminSubaccountsTool,
  createAdminSubaccountTool,
  getAdminSubaccountTool,
  updateAdminSubaccountTool,
];
