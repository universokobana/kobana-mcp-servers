import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as whatsappApi from '../api/whatsapp-channel.js';
import {
  getWhatsAppChannelSchema,
  createWhatsAppChannelSchema,
  updateWhatsAppChannelSchema,
  deleteWhatsAppChannelSchema,
  activateWhatsAppChannelSchema,
  deactivateWhatsAppChannelSchema,
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

export const getWhatsAppChannelTool: ToolDefinition = {
  name: 'get_mailbox_whatsapp_channel',
  description: 'Get the WhatsApp channel configuration for a mailbox entry.',
  inputSchema: getWhatsAppChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id } = getWhatsAppChannelSchema.parse(args);
      const channel = await whatsappApi.getWhatsAppChannel(client, entry_id);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createWhatsAppChannelTool: ToolDefinition = {
  name: 'create_mailbox_whatsapp_channel',
  description: 'Create a WhatsApp channel for a mailbox entry with inbox and outbox phone numbers.',
  inputSchema: createWhatsAppChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id, ...input } = createWhatsAppChannelSchema.parse(args);
      const channel = await whatsappApi.createWhatsAppChannel(client, entry_id, input);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateWhatsAppChannelTool: ToolDefinition = {
  name: 'update_mailbox_whatsapp_channel',
  description: 'Update the WhatsApp channel configuration for a mailbox entry.',
  inputSchema: updateWhatsAppChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id, ...input } = updateWhatsAppChannelSchema.parse(args);
      const channel = await whatsappApi.updateWhatsAppChannel(client, entry_id, input);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const deleteWhatsAppChannelTool: ToolDefinition = {
  name: 'delete_mailbox_whatsapp_channel',
  description: 'Delete the WhatsApp channel from a mailbox entry. Must deactivate first.',
  inputSchema: deleteWhatsAppChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id } = deleteWhatsAppChannelSchema.parse(args);
      await whatsappApi.deleteWhatsAppChannel(client, entry_id);
      return { success: true, data: { message: 'WhatsApp channel deleted successfully' } };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const activateWhatsAppChannelTool: ToolDefinition = {
  name: 'activate_mailbox_whatsapp_channel',
  description: 'Activate the WhatsApp channel for a mailbox entry.',
  inputSchema: activateWhatsAppChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id } = activateWhatsAppChannelSchema.parse(args);
      const channel = await whatsappApi.activateWhatsAppChannel(client, entry_id);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const deactivateWhatsAppChannelTool: ToolDefinition = {
  name: 'deactivate_mailbox_whatsapp_channel',
  description: 'Deactivate the WhatsApp channel for a mailbox entry.',
  inputSchema: deactivateWhatsAppChannelSchema,
  handler: async (client, args) => {
    try {
      const { entry_id } = deactivateWhatsAppChannelSchema.parse(args);
      const channel = await whatsappApi.deactivateWhatsAppChannel(client, entry_id);
      return { success: true, data: channel };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const whatsappChannelTools: ToolDefinition[] = [
  getWhatsAppChannelTool,
  createWhatsAppChannelTool,
  updateWhatsAppChannelTool,
  deleteWhatsAppChannelTool,
  activateWhatsAppChannelTool,
  deactivateWhatsAppChannelTool,
];
