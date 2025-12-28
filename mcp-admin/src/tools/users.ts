import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as usersApi from '../api/users.js';
import {
  listUsersSchema,
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
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

export const listAdminUsersTool: ToolDefinition = {
  name: 'list_admin_users',
  description: 'List all users in the account. Users can access the Kobana platform with specific permissions. Supports filtering by email and pagination.',
  inputSchema: listUsersSchema,
  handler: async (client, args) => {
    try {
      const filters = listUsersSchema.parse(args);
      const users = await usersApi.listUsers(client, filters);
      return { success: true, data: users };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createAdminUserTool: ToolDefinition = {
  name: 'create_admin_user',
  description: 'Create a new user in the account. Users can log into the Kobana platform with the assigned permissions. Requires email at minimum.',
  inputSchema: createUserSchema,
  handler: async (client, args) => {
    try {
      const input = createUserSchema.parse(args);
      const user = await usersApi.createUser(client, input);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateAdminUserTool: ToolDefinition = {
  name: 'update_admin_user',
  description: 'Update an existing user. Can modify email, name, and permissions.',
  inputSchema: updateUserSchema,
  handler: async (client, args) => {
    try {
      const { id, ...input } = updateUserSchema.parse(args);
      const user = await usersApi.updateUser(client, id, input);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const deleteAdminUserTool: ToolDefinition = {
  name: 'delete_admin_user',
  description: 'Delete a user from the account. This action is permanent and cannot be undone.',
  inputSchema: deleteUserSchema,
  handler: async (client, args) => {
    try {
      const { id } = deleteUserSchema.parse(args);
      await usersApi.deleteUser(client, id);
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const usersTools: ToolDefinition[] = [
  listAdminUsersTool,
  createAdminUserTool,
  updateAdminUserTool,
  deleteAdminUserTool,
];
