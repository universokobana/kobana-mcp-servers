import { KobanaApiClient } from './client.js';
import { FinancialProvider } from '../types/api.js';

const BASE_PATH = '/v2/financial/providers';

export async function listFinancialProviders(
  client: KobanaApiClient
): Promise<FinancialProvider[]> {
  return client.get<FinancialProvider[]>(BASE_PATH);
}
