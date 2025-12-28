import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as connectionsApi from '../api/connections.js';
import {
  listConnectionsSchema,
  createConnectionSchema,
  getConnectionSchema,
  updateConnectionSchema,
  deleteConnectionSchema,
  createAssociationSchema,
  deleteAssociationSchema,
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

export const listAdminConnectionsTool: ToolDefinition = {
  name: 'list_admin_connections',
  description: 'List all connections to financial providers (banks). Connections store credentials for API integrations. Supports filtering by provider, certificate, enabled/validated status, and creation date.',
  inputSchema: listConnectionsSchema,
  handler: async (client, args) => {
    try {
      const filters = listConnectionsSchema.parse(args);
      const connections = await connectionsApi.listConnections(client, filters);
      return { success: true, data: connections };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createAdminConnectionTool: ToolDefinition = {
  name: 'create_admin_connection',
  description: 'Create a new connection to a financial provider (bank). Requires provider_slug and credentials specific to the provider. Can optionally associate with service accounts (bank billet or pix accounts).',
  inputSchema: createConnectionSchema,
  handler: async (client, args) => {
    try {
      const input = createConnectionSchema.parse(args);
      const connection = await connectionsApi.createConnection(client, input);
      return { success: true, data: connection };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getAdminConnectionTool: ToolDefinition = {
  name: 'get_admin_connection',
  description: 'Get detailed information about a specific connection by its UID, including associated service accounts.',
  inputSchema: getConnectionSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getConnectionSchema.parse(args);
      const connection = await connectionsApi.getConnection(client, uid);
      return { success: true, data: connection };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateAdminConnectionTool: ToolDefinition = {
  name: 'update_admin_connection',
  description: 'Update an existing connection. Can modify label, environment, credentials, certificate, and enabled status. Use revalidate=true to verify credentials with the provider.',
  inputSchema: updateConnectionSchema,
  handler: async (client, args) => {
    try {
      const { uid, ...input } = updateConnectionSchema.parse(args);
      const connection = await connectionsApi.updateConnection(client, uid, input);
      return { success: true, data: connection };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const deleteAdminConnectionTool: ToolDefinition = {
  name: 'delete_admin_connection',
  description: 'Delete a connection to a financial provider. This action is permanent and will remove all associated credentials.',
  inputSchema: deleteConnectionSchema,
  handler: async (client, args) => {
    try {
      const { uid } = deleteConnectionSchema.parse(args);
      await connectionsApi.deleteConnection(client, uid);
      return { success: true, message: 'Connection deleted successfully' };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createAdminConnectionAssociationTool: ToolDefinition = {
  name: 'create_admin_connection_association',
  description: 'Associate a service account (bank billet account or pix account) with a connection. This links the credentials to the specific account for API operations.',
  inputSchema: createAssociationSchema,
  handler: async (client, args) => {
    try {
      const { connection_uid, resource } = createAssociationSchema.parse(args);
      const connection = await connectionsApi.createAssociation(client, connection_uid, { resource });
      return { success: true, data: connection };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const deleteAdminConnectionAssociationTool: ToolDefinition = {
  name: 'delete_admin_connection_association',
  description: 'Remove the association between a service account and a connection. The connection and service account remain, but are no longer linked.',
  inputSchema: deleteAssociationSchema,
  handler: async (client, args) => {
    try {
      const { connection_uid, resource } = deleteAssociationSchema.parse(args);
      const connection = await connectionsApi.deleteAssociation(client, connection_uid, { resource });
      return { success: true, data: connection };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const connectionsTools: ToolDefinition[] = [
  listAdminConnectionsTool,
  createAdminConnectionTool,
  getAdminConnectionTool,
  updateAdminConnectionTool,
  deleteAdminConnectionTool,
  createAdminConnectionAssociationTool,
  deleteAdminConnectionAssociationTool,
];
