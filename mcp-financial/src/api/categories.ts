import { KobanaApiClient } from './client.js';
import { StatementCategory } from '../types/api.js';

export async function listStatementCategories(
  client: KobanaApiClient
): Promise<StatementCategory[]> {
  return client.get<StatementCategory[]>('/v2/financial/statement_categories');
}
