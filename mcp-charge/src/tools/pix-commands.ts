import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as pixCommandsApi from '../api/pix-commands.js';
import {
  listPixCommandsSchema,
  getPixCommandSchema,
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

export const listChargePixCommandsTool: ToolDefinition = {
  name: 'list_charge_pix_commands',
  description: 'List all commands (operations) executed on a Pix charge. Commands include create, update, and cancel operations with their status and results.',
  inputSchema: listPixCommandsSchema,
  handler: async (client, args) => {
    try {
      const { pix_uid, ...params } = listPixCommandsSchema.parse(args);
      const commands = await pixCommandsApi.listPixCommands(client, pix_uid, params);
      return { success: true, data: commands };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getChargePixCommandTool: ToolDefinition = {
  name: 'get_charge_pix_command',
  description: 'Get details of a specific command executed on a Pix charge. Returns the command status, type, and result.',
  inputSchema: getPixCommandSchema,
  handler: async (client, args) => {
    try {
      const { pix_uid, id } = getPixCommandSchema.parse(args);
      const command = await pixCommandsApi.getPixCommand(client, pix_uid, id);
      return { success: true, data: command };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const pixCommandsTools: ToolDefinition[] = [
  listChargePixCommandsTool,
  getChargePixCommandTool,
];
