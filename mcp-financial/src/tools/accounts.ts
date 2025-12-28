import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as accountsApi from '../api/accounts.js';
import {
  listFinancialAccountsSchema,
  createFinancialAccountSchema,
  getFinancialAccountSchema,
  updateFinancialAccountSchema,
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

export const listFinancialAccountsTool: ToolDefinition = {
  name: 'list_financial_accounts',
  description: 'List all financial accounts registered in the platform. Supports pagination.',
  inputSchema: listFinancialAccountsSchema,
  handler: async (client, args) => {
    try {
      const params = listFinancialAccountsSchema.parse(args);
      const accounts = await accountsApi.listFinancialAccounts(client, params);
      return { success: true, data: accounts };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createFinancialAccountTool: ToolDefinition = {
  name: 'create_financial_account',
  description: 'Create a new financial account. Requires account number, digit, agency number, and financial provider.',
  inputSchema: createFinancialAccountSchema,
  handler: async (client, args) => {
    try {
      const input = createFinancialAccountSchema.parse(args);
      const account = await accountsApi.createFinancialAccount(client, input);
      return { success: true, data: account };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getFinancialAccountTool: ToolDefinition = {
  name: 'get_financial_account',
  description: 'Get details of a specific financial account by its unique identifier.',
  inputSchema: getFinancialAccountSchema,
  handler: async (client, args) => {
    try {
      const { id } = getFinancialAccountSchema.parse(args);
      const account = await accountsApi.getFinancialAccount(client, id);
      return { success: true, data: account };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateFinancialAccountTool: ToolDefinition = {
  name: 'update_financial_account',
  description: 'Update an existing financial account. You can update account details, custom name, tags, and more.',
  inputSchema: updateFinancialAccountSchema,
  handler: async (client, args) => {
    try {
      const { id, ...input } = updateFinancialAccountSchema.parse(args);
      const account = await accountsApi.updateFinancialAccount(client, id, input);
      return { success: true, data: account };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const accountsTools: ToolDefinition[] = [
  listFinancialAccountsTool,
  createFinancialAccountTool,
  getFinancialAccountTool,
  updateFinancialAccountTool,
];
