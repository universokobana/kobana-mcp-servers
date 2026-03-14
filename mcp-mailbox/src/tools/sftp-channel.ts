import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as sftpApi from '../api/sftp-channel.js';
import {
  getSftpChannelSchema,
  createSftpChannelSchema,
  updateSftpChannelSchema,
  deleteSftpChannelSchema,
  activateSftpChannelSchema,
  deactivateSftpChannelSchema,
  fetchSftpFilesSchema,
  updateSftpCredentialsSchema,
} from '../types/schemas.js';
import type { ToolDefinition } from './entries.js';

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

export const getSftpChannelTool: ToolDefinition = {
  name: 'get_mailbox_sftp_channel',
  description: 'Get the SFTP channel configuration for a mailbox entry.',
  inputSchema: getSftpChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id } = getSftpChannelSchema.parse(args);
      const channel = await sftpApi.getSftpChannel(client, entry_id);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createSftpChannelTool: ToolDefinition = {
  name: 'create_mailbox_sftp_channel',
  description: 'Create an SFTP channel for a mailbox entry with server connection details.',
  inputSchema: createSftpChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id, ...input } = createSftpChannelSchema.parse(args);
      const channel = await sftpApi.createSftpChannel(client, entry_id, input);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateSftpChannelTool: ToolDefinition = {
  name: 'update_mailbox_sftp_channel',
  description: 'Update the SFTP channel configuration (username and SSH key).',
  inputSchema: updateSftpChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id, ...input } = updateSftpChannelSchema.parse(args);
      const channel = await sftpApi.updateSftpChannel(client, entry_id, input);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const deleteSftpChannelTool: ToolDefinition = {
  name: 'delete_mailbox_sftp_channel',
  description: 'Delete the SFTP channel from a mailbox entry. Must deactivate first.',
  inputSchema: deleteSftpChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id } = deleteSftpChannelSchema.parse(args);
      await sftpApi.deleteSftpChannel(client, entry_id);
      return { success: true, data: { message: 'SFTP channel deleted successfully' } };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const activateSftpChannelTool: ToolDefinition = {
  name: 'activate_mailbox_sftp_channel',
  description: 'Activate the SFTP channel for a mailbox entry.',
  inputSchema: activateSftpChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id } = activateSftpChannelSchema.parse(args);
      const channel = await sftpApi.activateSftpChannel(client, entry_id);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const deactivateSftpChannelTool: ToolDefinition = {
  name: 'deactivate_mailbox_sftp_channel',
  description: 'Deactivate the SFTP channel for a mailbox entry.',
  inputSchema: deactivateSftpChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id } = deactivateSftpChannelSchema.parse(args);
      const channel = await sftpApi.deactivateSftpChannel(client, entry_id);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const fetchSftpFilesTool: ToolDefinition = {
  name: 'fetch_mailbox_sftp_files',
  description: 'Queue a file retrieval from the SFTP server for a mailbox entry.',
  inputSchema: fetchSftpFilesSchema,
  handler: async (client, args) => {
    try {
      const { entry_id } = fetchSftpFilesSchema.parse(args);
      const channel = await sftpApi.fetchSftpFiles(client, entry_id);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateSftpCredentialsTool: ToolDefinition = {
  name: 'update_mailbox_sftp_credentials',
  description: 'Queue an update of the SSH credentials for the SFTP channel.',
  inputSchema: updateSftpCredentialsSchema,
  handler: async (client, args) => {
    try {
      const { entry_id } = updateSftpCredentialsSchema.parse(args);
      const channel = await sftpApi.updateSftpCredentials(client, entry_id);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const sftpChannelTools: ToolDefinition[] = [
  getSftpChannelTool,
  createSftpChannelTool,
  updateSftpChannelTool,
  deleteSftpChannelTool,
  activateSftpChannelTool,
  deactivateSftpChannelTool,
  fetchSftpFilesTool,
  updateSftpCredentialsTool,
];
