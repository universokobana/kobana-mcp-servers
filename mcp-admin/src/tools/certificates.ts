import { z } from 'zod';
import { KobanaApiClient, KobanaApiError } from '../api/client.js';
import * as certificatesApi from '../api/certificates.js';
import {
  listCertificatesSchema,
  createCertificateSchema,
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

export const listAdminCertificatesTool: ToolDefinition = {
  name: 'list_admin_certificates',
  description: 'List all digital certificates uploaded to the account. Certificates are used to authenticate with financial providers for API integrations. Supports pagination.',
  inputSchema: listCertificatesSchema,
  handler: async (client, args) => {
    try {
      const filters = listCertificatesSchema.parse(args);
      const certificates = await certificatesApi.listCertificates(client, filters);
      return { success: true, data: certificates };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const createAdminCertificateTool: ToolDefinition = {
  name: 'create_admin_certificate',
  description: 'Upload a new digital certificate. Certificates can be CRT (requires .crt and .key files) or PFX (requires .pfx file and password). Used for bank API integrations.',
  inputSchema: createCertificateSchema,
  handler: async (client, args) => {
    try {
      const input = createCertificateSchema.parse(args);
      const certificate = await certificatesApi.createCertificate(client, input);
      return { success: true, data: certificate };
    } catch (error) {
      return { success: false, ...formatError(error) };
    }
  },
};

export const certificatesTools: ToolDefinition[] = [
  listAdminCertificatesTool,
  createAdminCertificateTool,
];
