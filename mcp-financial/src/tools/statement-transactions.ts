import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as statementTransactionsApi from '../api/statement-transactions.js';
import {
  listStatementTransactionsSchema,
  syncStatementTransactionsSchema,
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

export const listStatementTransactionsTool: ToolDefinition = {
  name: 'list_financial_statement_transactions',
  description: 'List all statement transactions for a specific financial account. Supports filtering by occurrence date and pagination.',
  inputSchema: listStatementTransactionsSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, ...params } = listStatementTransactionsSchema.parse(args);
      const transactions = await statementTransactionsApi.listStatementTransactions(
        client,
        financial_account_uid,
        params
      );
      return { success: true, data: transactions };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const syncStatementTransactionsTool: ToolDefinition = {
  name: 'sync_financial_statement_transactions',
  description: 'Trigger a synchronization of statement transactions for a financial account. This operation is asynchronous and returns a command object.',
  inputSchema: syncStatementTransactionsSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid } = syncStatementTransactionsSchema.parse(args);
      const command = await statementTransactionsApi.syncStatementTransactions(client, financial_account_uid);
      return { success: true, data: command };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const statementTransactionsTools: ToolDefinition[] = [
  listStatementTransactionsTool,
  syncStatementTransactionsTool,
];
