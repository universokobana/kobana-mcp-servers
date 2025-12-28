import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as commandsApi from '../api/commands.js';
import {
  listFinancialAccountCommandsSchema,
  getFinancialAccountCommandSchema,
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

export const listFinancialAccountCommandsTool: ToolDefinition = {
  name: 'list_financial_account_commands',
  description: 'List all commands executed for a specific financial account. Commands track operations like statement sync.',
  inputSchema: listFinancialAccountCommandsSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid } = listFinancialAccountCommandsSchema.parse(args);
      const commands = await commandsApi.listFinancialAccountCommands(client, financial_account_uid);
      return { success: true, data: commands };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getFinancialAccountCommandTool: ToolDefinition = {
  name: 'get_financial_account_command',
  description: 'Get details of a specific command by its unique identifier.',
  inputSchema: getFinancialAccountCommandSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, id } = getFinancialAccountCommandSchema.parse(args);
      const command = await commandsApi.getFinancialAccountCommand(client, financial_account_uid, id);
      return { success: true, data: command };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const commandsTools: ToolDefinition[] = [
  listFinancialAccountCommandsTool,
  getFinancialAccountCommandTool,
];
