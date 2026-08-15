import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as categoriesApi from '../api/categories.js';
import { listStatementCategoriesSchema } from '../types/schemas.js';

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

export const listStatementCategoriesTool: ToolDefinition = {
  name: 'list_financial_statement_categories',
  description: 'List the catalog of categories a statement transaction can carry. Required to use the category filter on list_financial_statement_transactions and summarize_financial_statement_transactions, since category codes form a closed domain.',
  inputSchema: listStatementCategoriesSchema,
  handler: async (client) => {
    try {
      const categories = await categoriesApi.listStatementCategories(client);
      return { success: true, data: categories };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const categoriesTools: ToolDefinition[] = [listStatementCategoriesTool];
