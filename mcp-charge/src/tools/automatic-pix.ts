import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as automaticPixApi from '../api/automatic-pix.js';
import {
  listAutomaticPixPixSchema,
  getAutomaticPixPixSchema,
  patchAutomaticPixPixSchema,
  cancelAutomaticPixPixSchema,
  retryAutomaticPixPixSchema,
  updateAutomaticPixPixSchema,
  listAutomaticPixRecurrencesSchema,
  createAutomaticPixRecurrenceSchema,
  getAutomaticPixRecurrenceSchema,
  patchAutomaticPixRecurrenceSchema,
  cancelAutomaticPixRecurrenceSchema,
  updateAutomaticPixRecurrenceSchema,
  createAutomaticPixRecurrencePixSchema,
  createAutomaticPixRecurrenceRequestSchema,
  listAutomaticPixRequestsSchema,
  getAutomaticPixRequestSchema,
  patchAutomaticPixRequestSchema,
  cancelAutomaticPixRequestSchema,
} from '../types/automatic-pix-schemas.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  handler: (client: KobanaApiClient, args: unknown) => Promise<unknown>;
}

function formatError(error: unknown): { error: string; details?: unknown } {
  if (error instanceof KobanaApiError) {
    return { error: error.message, details: error.toJSON() };
  }
  if (error instanceof Error) {
    return { error: error.message };
  }
  return { error: 'Unknown error occurred' };
}

// Automatic Pix - Pix Tools

export const listChargeAutomaticPixPixTool: ToolDefinition = {
  name: 'list_charge_automatic_pix',
  description: 'List all automatic Pix charges. Supports filtering by status and recurrence.',
  inputSchema: listAutomaticPixPixSchema,
  handler: async (client, args) => {
    try {
      const filters = listAutomaticPixPixSchema.parse(args);
      const result = await automaticPixApi.listAutomaticPixPix(client, filters);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getChargeAutomaticPixPixTool: ToolDefinition = {
  name: 'get_charge_automatic_pix',
  description: 'Get details of a specific automatic Pix charge.',
  inputSchema: getAutomaticPixPixSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getAutomaticPixPixSchema.parse(args);
      const result = await automaticPixApi.getAutomaticPixPix(client, uid);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const patchChargeAutomaticPixPixTool: ToolDefinition = {
  name: 'patch_charge_automatic_pix',
  description: 'Partially update an automatic Pix charge (e.g., update tags).',
  inputSchema: patchAutomaticPixPixSchema,
  handler: async (client, args) => {
    try {
      const { uid, ...input } = patchAutomaticPixPixSchema.parse(args);
      const result = await automaticPixApi.patchAutomaticPixPix(client, uid, input);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const cancelChargeAutomaticPixPixTool: ToolDefinition = {
  name: 'cancel_charge_automatic_pix',
  description: 'Cancel an automatic Pix charge.',
  inputSchema: cancelAutomaticPixPixSchema,
  handler: async (client, args) => {
    try {
      const { uid } = cancelAutomaticPixPixSchema.parse(args);
      const result = await automaticPixApi.cancelAutomaticPixPix(client, uid);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const retryChargeAutomaticPixPixTool: ToolDefinition = {
  name: 'retry_charge_automatic_pix',
  description: 'Retry a failed automatic Pix charge.',
  inputSchema: retryAutomaticPixPixSchema,
  handler: async (client, args) => {
    try {
      const { uid } = retryAutomaticPixPixSchema.parse(args);
      const result = await automaticPixApi.retryAutomaticPixPix(client, uid);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateChargeAutomaticPixPixTool: ToolDefinition = {
  name: 'update_charge_automatic_pix',
  description: 'Update an automatic Pix charge (amount, expiration).',
  inputSchema: updateAutomaticPixPixSchema,
  handler: async (client, args) => {
    try {
      const { uid, ...input } = updateAutomaticPixPixSchema.parse(args);
      const result = await automaticPixApi.updateAutomaticPixPix(client, uid, input);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

// Automatic Pix - Recurrences Tools

export const listChargeAutomaticPixRecurrencesTool: ToolDefinition = {
  name: 'list_charge_automatic_pix_recurrences',
  description: 'List all automatic Pix recurrences.',
  inputSchema: listAutomaticPixRecurrencesSchema,
  handler: async (client, args) => {
    try {
      const filters = listAutomaticPixRecurrencesSchema.parse(args);
      const result = await automaticPixApi.listAutomaticPixRecurrences(client, filters);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createChargeAutomaticPixRecurrenceTool: ToolDefinition = {
  name: 'create_charge_automatic_pix_recurrence',
  description: 'Create a new automatic Pix recurrence for scheduled payments.',
  inputSchema: createAutomaticPixRecurrenceSchema,
  handler: async (client, args) => {
    try {
      const input = createAutomaticPixRecurrenceSchema.parse(args);
      const result = await automaticPixApi.createAutomaticPixRecurrence(client, input);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getChargeAutomaticPixRecurrenceTool: ToolDefinition = {
  name: 'get_charge_automatic_pix_recurrence',
  description: 'Get details of a specific automatic Pix recurrence.',
  inputSchema: getAutomaticPixRecurrenceSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getAutomaticPixRecurrenceSchema.parse(args);
      const result = await automaticPixApi.getAutomaticPixRecurrence(client, uid);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const patchChargeAutomaticPixRecurrenceTool: ToolDefinition = {
  name: 'patch_charge_automatic_pix_recurrence',
  description: 'Partially update an automatic Pix recurrence.',
  inputSchema: patchAutomaticPixRecurrenceSchema,
  handler: async (client, args) => {
    try {
      const { uid, ...input } = patchAutomaticPixRecurrenceSchema.parse(args);
      const result = await automaticPixApi.patchAutomaticPixRecurrence(client, uid, input);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const cancelChargeAutomaticPixRecurrenceTool: ToolDefinition = {
  name: 'cancel_charge_automatic_pix_recurrence',
  description: 'Cancel an automatic Pix recurrence.',
  inputSchema: cancelAutomaticPixRecurrenceSchema,
  handler: async (client, args) => {
    try {
      const { uid } = cancelAutomaticPixRecurrenceSchema.parse(args);
      const result = await automaticPixApi.cancelAutomaticPixRecurrence(client, uid);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateChargeAutomaticPixRecurrenceTool: ToolDefinition = {
  name: 'update_charge_automatic_pix_recurrence',
  description: 'Update an automatic Pix recurrence.',
  inputSchema: updateAutomaticPixRecurrenceSchema,
  handler: async (client, args) => {
    try {
      const { uid, ...input } = updateAutomaticPixRecurrenceSchema.parse(args);
      const result = await automaticPixApi.updateAutomaticPixRecurrence(client, uid, input);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createChargeAutomaticPixRecurrencePixTool: ToolDefinition = {
  name: 'create_charge_automatic_pix_recurrence_pix',
  description: 'Create a Pix charge from a recurrence.',
  inputSchema: createAutomaticPixRecurrencePixSchema,
  handler: async (client, args) => {
    try {
      const { recurrence_uid, ...input } = createAutomaticPixRecurrencePixSchema.parse(args);
      const result = await automaticPixApi.createAutomaticPixRecurrencePix(client, recurrence_uid, input);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createChargeAutomaticPixRecurrenceRequestTool: ToolDefinition = {
  name: 'create_charge_automatic_pix_recurrence_request',
  description: 'Create a request from a recurrence.',
  inputSchema: createAutomaticPixRecurrenceRequestSchema,
  handler: async (client, args) => {
    try {
      const { recurrence_uid, ...input } = createAutomaticPixRecurrenceRequestSchema.parse(args);
      const result = await automaticPixApi.createAutomaticPixRecurrenceRequest(client, recurrence_uid, input);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

// Automatic Pix - Requests Tools

export const listChargeAutomaticPixRequestsTool: ToolDefinition = {
  name: 'list_charge_automatic_pix_requests',
  description: 'List all automatic Pix requests.',
  inputSchema: listAutomaticPixRequestsSchema,
  handler: async (client, args) => {
    try {
      const filters = listAutomaticPixRequestsSchema.parse(args);
      const result = await automaticPixApi.listAutomaticPixRequests(client, filters);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getChargeAutomaticPixRequestTool: ToolDefinition = {
  name: 'get_charge_automatic_pix_request',
  description: 'Get details of a specific automatic Pix request.',
  inputSchema: getAutomaticPixRequestSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getAutomaticPixRequestSchema.parse(args);
      const result = await automaticPixApi.getAutomaticPixRequest(client, uid);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const patchChargeAutomaticPixRequestTool: ToolDefinition = {
  name: 'patch_charge_automatic_pix_request',
  description: 'Partially update an automatic Pix request.',
  inputSchema: patchAutomaticPixRequestSchema,
  handler: async (client, args) => {
    try {
      const { uid, ...input } = patchAutomaticPixRequestSchema.parse(args);
      const result = await automaticPixApi.patchAutomaticPixRequest(client, uid, input);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const cancelChargeAutomaticPixRequestTool: ToolDefinition = {
  name: 'cancel_charge_automatic_pix_request',
  description: 'Cancel an automatic Pix request.',
  inputSchema: cancelAutomaticPixRequestSchema,
  handler: async (client, args) => {
    try {
      const { uid } = cancelAutomaticPixRequestSchema.parse(args);
      const result = await automaticPixApi.cancelAutomaticPixRequest(client, uid);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const automaticPixTools: ToolDefinition[] = [
  // Pix
  listChargeAutomaticPixPixTool,
  getChargeAutomaticPixPixTool,
  patchChargeAutomaticPixPixTool,
  cancelChargeAutomaticPixPixTool,
  retryChargeAutomaticPixPixTool,
  updateChargeAutomaticPixPixTool,
  // Recurrences
  listChargeAutomaticPixRecurrencesTool,
  createChargeAutomaticPixRecurrenceTool,
  getChargeAutomaticPixRecurrenceTool,
  patchChargeAutomaticPixRecurrenceTool,
  cancelChargeAutomaticPixRecurrenceTool,
  updateChargeAutomaticPixRecurrenceTool,
  createChargeAutomaticPixRecurrencePixTool,
  createChargeAutomaticPixRecurrenceRequestTool,
  // Requests
  listChargeAutomaticPixRequestsTool,
  getChargeAutomaticPixRequestTool,
  patchChargeAutomaticPixRequestTool,
  cancelChargeAutomaticPixRequestTool,
];
