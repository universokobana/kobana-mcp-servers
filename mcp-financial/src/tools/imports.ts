import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as importsApi from '../api/imports.js';
import {
  listStatementTransactionImportsSchema,
  createStatementTransactionImportSchema,
  getStatementTransactionImportSchema,
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

export const listStatementTransactionImportsTool: ToolDefinition = {
  name: 'list_financial_statement_transaction_imports',
  description: 'List all statement transaction imports for a specific financial account. Supports filtering by status, dates, and tags.',
  inputSchema: listStatementTransactionImportsSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, ...params } = listStatementTransactionImportsSchema.parse(args);
      const imports = await importsApi.listStatementTransactionImports(client, financial_account_uid, params);
      return { success: true, data: imports };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createStatementTransactionImportTool: ToolDefinition = {
  name: 'create_financial_statement_transaction_import',
  description: 'Create a new statement transaction import from a file. The source should be the file content (base64 encoded).',
  inputSchema: createStatementTransactionImportSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, ...input } = createStatementTransactionImportSchema.parse(args);
      const importResult = await importsApi.createStatementTransactionImport(client, financial_account_uid, input);
      return { success: true, data: importResult };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getStatementTransactionImportTool: ToolDefinition = {
  name: 'get_financial_statement_transaction_import',
  description: 'Get details of a specific statement transaction import by its unique identifier.',
  inputSchema: getStatementTransactionImportSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, uid } = getStatementTransactionImportSchema.parse(args);
      const importResult = await importsApi.getStatementTransactionImport(client, financial_account_uid, uid);
      return { success: true, data: importResult };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const importsTools: ToolDefinition[] = [
  listStatementTransactionImportsTool,
  createStatementTransactionImportTool,
  getStatementTransactionImportTool,
];
