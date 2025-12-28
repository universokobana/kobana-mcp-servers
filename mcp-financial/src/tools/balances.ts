import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as balancesApi from '../api/balances.js';
import {
  listFinancialAccountBalancesSchema,
  createFinancialAccountBalanceSchema,
  getFinancialAccountBalanceSchema,
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

export const listFinancialAccountBalancesTool: ToolDefinition = {
  name: 'list_financial_account_balances',
  description: 'List all balance records for a specific financial account. Supports pagination.',
  inputSchema: listFinancialAccountBalancesSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, ...params } = listFinancialAccountBalancesSchema.parse(args);
      const balances = await balancesApi.listFinancialAccountBalances(client, financial_account_uid, params);
      return { success: true, data: balances };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createFinancialAccountBalanceTool: ToolDefinition = {
  name: 'create_financial_account_balance',
  description: 'Create a new balance record for a financial account. Requires amount and optionally blocked amount and invested amount.',
  inputSchema: createFinancialAccountBalanceSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, ...input } = createFinancialAccountBalanceSchema.parse(args);
      const balance = await balancesApi.createFinancialAccountBalance(client, financial_account_uid, input);
      return { success: true, data: balance };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getFinancialAccountBalanceTool: ToolDefinition = {
  name: 'get_financial_account_balance',
  description: 'Get details of a specific balance record by its unique identifier.',
  inputSchema: getFinancialAccountBalanceSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, balance_uid } = getFinancialAccountBalanceSchema.parse(args);
      const balance = await balancesApi.getFinancialAccountBalance(client, financial_account_uid, balance_uid);
      return { success: true, data: balance };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const balancesTools: ToolDefinition[] = [
  listFinancialAccountBalancesTool,
  createFinancialAccountBalanceTool,
  getFinancialAccountBalanceTool,
];
