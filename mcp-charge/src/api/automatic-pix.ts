import { KobanaApiClient } from './client.js';
import {
  AutomaticPixPix,
  AutomaticPixRecurrence,
  AutomaticPixRequest,
  CreateAutomaticPixRecurrenceInput,
  UpdateAutomaticPixRecurrenceInput,
  UpdateAutomaticPixPixInput,
  CreateAutomaticPixRecurrencePixInput,
  CreateAutomaticPixRecurrenceRequestInput,
  ListAutomaticPixPixFilters,
  ListAutomaticPixRecurrencesFilters,
  ListAutomaticPixRequestsFilters,
} from '../types/automatic-pix.js';

const BASE_PATH = '/v2/charge/automatic_pix';

// Automatic Pix - Pix

export async function listAutomaticPixPix(
  client: KobanaApiClient,
  filters?: ListAutomaticPixPixFilters
): Promise<AutomaticPixPix[]> {
  return client.get<AutomaticPixPix[]>(`${BASE_PATH}/pix`, filters as Record<string, unknown>);
}

export async function getAutomaticPixPix(
  client: KobanaApiClient,
  uid: string
): Promise<AutomaticPixPix> {
  return client.get<AutomaticPixPix>(`${BASE_PATH}/pix/${uid}`);
}

export async function patchAutomaticPixPix(
  client: KobanaApiClient,
  uid: string,
  input: { tags?: string[] }
): Promise<AutomaticPixPix> {
  return client.patch<AutomaticPixPix>(`${BASE_PATH}/pix/${uid}`, { pix: input });
}

export async function cancelAutomaticPixPix(
  client: KobanaApiClient,
  uid: string
): Promise<{ command: unknown }> {
  return client.put<{ command: unknown }>(`${BASE_PATH}/pix/${uid}/cancel`);
}

export async function retryAutomaticPixPix(
  client: KobanaApiClient,
  uid: string
): Promise<{ command: unknown }> {
  return client.put<{ command: unknown }>(`${BASE_PATH}/pix/${uid}/retry`);
}

export async function updateAutomaticPixPix(
  client: KobanaApiClient,
  uid: string,
  input: UpdateAutomaticPixPixInput
): Promise<{ command: unknown }> {
  return client.put<{ command: unknown }>(`${BASE_PATH}/pix/${uid}/update`, { pix: input });
}

// Automatic Pix - Recurrences

export async function listAutomaticPixRecurrences(
  client: KobanaApiClient,
  filters?: ListAutomaticPixRecurrencesFilters
): Promise<AutomaticPixRecurrence[]> {
  return client.get<AutomaticPixRecurrence[]>(`${BASE_PATH}/recurrences`, filters as Record<string, unknown>);
}

export async function createAutomaticPixRecurrence(
  client: KobanaApiClient,
  input: CreateAutomaticPixRecurrenceInput
): Promise<AutomaticPixRecurrence> {
  return client.post<AutomaticPixRecurrence>(`${BASE_PATH}/recurrences`, { recurrence: input });
}

export async function getAutomaticPixRecurrence(
  client: KobanaApiClient,
  uid: string
): Promise<AutomaticPixRecurrence> {
  return client.get<AutomaticPixRecurrence>(`${BASE_PATH}/recurrences/${uid}`);
}

export async function patchAutomaticPixRecurrence(
  client: KobanaApiClient,
  uid: string,
  input: { tags?: string[] }
): Promise<AutomaticPixRecurrence> {
  return client.patch<AutomaticPixRecurrence>(`${BASE_PATH}/recurrences/${uid}`, { recurrence: input });
}

export async function cancelAutomaticPixRecurrence(
  client: KobanaApiClient,
  uid: string
): Promise<{ command: unknown }> {
  return client.put<{ command: unknown }>(`${BASE_PATH}/recurrences/${uid}/cancel`);
}

export async function updateAutomaticPixRecurrence(
  client: KobanaApiClient,
  uid: string,
  input: UpdateAutomaticPixRecurrenceInput
): Promise<{ command: unknown }> {
  return client.put<{ command: unknown }>(`${BASE_PATH}/recurrences/${uid}/update`, { recurrence: input });
}

export async function createAutomaticPixRecurrencePix(
  client: KobanaApiClient,
  recurrenceUid: string,
  input: CreateAutomaticPixRecurrencePixInput
): Promise<AutomaticPixPix> {
  return client.post<AutomaticPixPix>(`${BASE_PATH}/recurrences/${recurrenceUid}/pix`, { pix: input });
}

export async function createAutomaticPixRecurrenceRequest(
  client: KobanaApiClient,
  recurrenceUid: string,
  input: CreateAutomaticPixRecurrenceRequestInput
): Promise<AutomaticPixRequest> {
  return client.post<AutomaticPixRequest>(`${BASE_PATH}/recurrences/${recurrenceUid}/requests`, { request: input });
}

// Automatic Pix - Requests

export async function listAutomaticPixRequests(
  client: KobanaApiClient,
  filters?: ListAutomaticPixRequestsFilters
): Promise<AutomaticPixRequest[]> {
  return client.get<AutomaticPixRequest[]>(`${BASE_PATH}/requests`, filters as Record<string, unknown>);
}

export async function getAutomaticPixRequest(
  client: KobanaApiClient,
  uid: string
): Promise<AutomaticPixRequest> {
  return client.get<AutomaticPixRequest>(`${BASE_PATH}/requests/${uid}`);
}

export async function patchAutomaticPixRequest(
  client: KobanaApiClient,
  uid: string,
  input: { tags?: string[] }
): Promise<AutomaticPixRequest> {
  return client.patch<AutomaticPixRequest>(`${BASE_PATH}/requests/${uid}`, { request: input });
}

export async function cancelAutomaticPixRequest(
  client: KobanaApiClient,
  uid: string
): Promise<{ command: unknown }> {
  return client.put<{ command: unknown }>(`${BASE_PATH}/requests/${uid}/cancel`);
}
