import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as statementTransactionsApi from '../api/statement-transactions.js';
import {
  listStatementTransactionsSchema,
  summarizeStatementTransactionsSchema,
  syncStatementTransactionsSchema,
  listStatementTransactionSyncsSchema,
  getStatementTransactionSyncSchema,
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
  description: 'List statement transactions for a financial account. Supports filtering by date, kind, amount, category, and free-text search, plus offset or cursor-based pagination. Without date filters, a request without date_window="strict" returns the full account history — this changes to a 180-day default on 2027-02-05, so pass date_window="strict" to opt into the future behavior early.',
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

export const summarizeStatementTransactionsTool: ToolDefinition = {
  name: 'summarize_financial_statement_transactions',
  description: 'Aggregate statement transactions into totals by group (day, week, month, kind, and/or category) instead of returning individual rows. Supports up to a 730-day window and the same filters as the listing endpoint.',
  inputSchema: summarizeStatementTransactionsSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, ...params } = summarizeStatementTransactionsSchema.parse(args);
      const summary = await statementTransactionsApi.summarizeStatementTransactions(
        client,
        financial_account_uid,
        params
      );
      return { success: true, data: summary };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const syncStatementTransactionsTool: ToolDefinition = {
  name: 'sync_financial_statement_transactions',
  description: 'Trigger a synchronization of statement transactions for a financial account by fetching them from the bank. Asynchronous: returns a command plus a sync request UID for tracking. Windows spanning multiple calendar months are split into one command per month. Default window: first day of the current month through today.',
  inputSchema: syncStatementTransactionsSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, ...input } = syncStatementTransactionsSchema.parse(args);
      const result = await statementTransactionsApi.syncStatementTransactions(client, financial_account_uid, input);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const listStatementTransactionSyncsTool: ToolDefinition = {
  name: 'list_financial_statement_transaction_syncs',
  description: 'List statement synchronization requests made via sync_financial_statement_transactions for a financial account, newest first. Only API-requested synchronizations appear here; automatic periodic syncs are not logged.',
  inputSchema: listStatementTransactionSyncsSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, ...params } = listStatementTransactionSyncsSchema.parse(args);
      const syncs = await statementTransactionsApi.listStatementTransactionSyncs(client, financial_account_uid, params);
      return { success: true, data: syncs };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const getStatementTransactionSyncTool: ToolDefinition = {
  name: 'get_financial_statement_transaction_sync',
  description: 'Get the status of a statement synchronization request by its UID, including the per-month commands it aggregates (each with its own date window and error message when applicable).',
  inputSchema: getStatementTransactionSyncSchema,
  handler: async (client, args) => {
    try {
      const { financial_account_uid, uid } = getStatementTransactionSyncSchema.parse(args);
      const sync = await statementTransactionsApi.getStatementTransactionSync(client, financial_account_uid, uid);
      return { success: true, data: sync };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const statementTransactionsTools: ToolDefinition[] = [
  listStatementTransactionsTool,
  summarizeStatementTransactionsTool,
  syncStatementTransactionsTool,
  listStatementTransactionSyncsTool,
  getStatementTransactionSyncTool,
];
