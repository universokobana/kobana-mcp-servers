import { KobanaApiClient } from './client.js';
import { FinancialAccountCommand } from '../types/api.js';

function getBasePath(financialAccountUid: string): string {
  return `/v2/financial/accounts/${financialAccountUid}/commands`;
}

export async function listFinancialAccountCommands(
  client: KobanaApiClient,
  financialAccountUid: string
): Promise<FinancialAccountCommand[]> {
  return client.get<FinancialAccountCommand[]>(getBasePath(financialAccountUid));
}

export async function getFinancialAccountCommand(
  client: KobanaApiClient,
  financialAccountUid: string,
  id: string
): Promise<FinancialAccountCommand> {
  return client.get<FinancialAccountCommand>(`${getBasePath(financialAccountUid)}/${id}`);
}
