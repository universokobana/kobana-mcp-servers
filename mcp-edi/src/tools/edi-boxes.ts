import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as ediBoxesApi from '../api/edi-boxes.js';
import {
  listEdiBoxesSchema,
  createEdiBoxSchema,
  getEdiBoxSchema,
  updateEdiBoxSchema,
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

export const listEdiBoxesTool: ToolDefinition = {
  name: 'list_edi_boxes',
  description: 'List all EDI boxes (Caixas Postais). EDI boxes are used to manage CNAB file transmission for billing, statements, and payments. Supports pagination and filtering by resource type.',
  inputSchema: listEdiBoxesSchema,
  handler: async (client, args) => {
    try {
      const params = listEdiBoxesSchema.parse(args);
      const response = await ediBoxesApi.listEdiBoxes(client, params);
      return { success: true, data: response.data, pagination: response.pagination };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createEdiBoxTool: ToolDefinition = {
  name: 'create_edi_box',
  description: 'Create a new EDI box (Caixa Postal) for CNAB file transmission. Requires resource association (billing wallet or financial account), account owner, and letter owner information. Optionally specify operation type (charge/statement/payment) and CNAB format (cnab400/cnab240/cnab200).',
  inputSchema: createEdiBoxSchema,
  handler: async (client, args) => {
    try {
      const input = createEdiBoxSchema.parse(args);
      const response = await ediBoxesApi.createEdiBox(client, input);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getEdiBoxTool: ToolDefinition = {
  name: 'get_edi_box',
  description: 'Get details of a specific EDI box (Caixa Postal) by its unique identifier (UID). Returns complete information including status, letter PDF URL, and associated contacts.',
  inputSchema: getEdiBoxSchema,
  handler: async (client, args) => {
    try {
      const { uid } = getEdiBoxSchema.parse(args);
      const response = await ediBoxesApi.getEdiBox(client, uid);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const updateEdiBoxTool: ToolDefinition = {
  name: 'update_edi_box',
  description: 'Update an existing EDI box (Caixa Postal). Can update resource association, name, operation type, CNAB format, account owner, bank manager, letter owner, and business logo.',
  inputSchema: updateEdiBoxSchema,
  handler: async (client, args) => {
    try {
      const { uid, ...input } = updateEdiBoxSchema.parse(args);
      const response = await ediBoxesApi.updateEdiBox(client, uid, input);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const ediBoxesTools: ToolDefinition[] = [
  listEdiBoxesTool,
  createEdiBoxTool,
  getEdiBoxTool,
  updateEdiBoxTool,
];
