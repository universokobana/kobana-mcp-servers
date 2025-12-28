import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as providersApi from '../api/providers.js';
import { listFinancialProvidersSchema } from '../types/schemas.js';

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

export const listFinancialProvidersTool: ToolDefinition = {
  name: 'list_financial_providers',
  description: 'List all financial providers (banks and payment institutions) available in the Kobana platform.',
  inputSchema: listFinancialProvidersSchema,
  handler: async (client) => {
    try {
      const providers = await providersApi.listFinancialProviders(client);
      return { success: true, data: providers };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const providersTools: ToolDefinition[] = [
  listFinancialProvidersTool,
];
