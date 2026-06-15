import { apiClient } from './client';
import type { components } from '../../../generated/api-types';

export type TermsVersion = components['schemas']['TermsContentResponse'];
type ConsentInput = components['schemas']['ConsentInput'];
type ConsentRecord = components['schemas']['ConsentRecordResponse'];

export const TERMS_QUERY_KEYS = {
  activeTerms: ['terms', 'active'] as const,
  myConsents: ['me', 'consents'] as const,
};

export async function getActiveTerms(): Promise<TermsVersion[]> {
  const res = await apiClient.get('/api/v1/terms');
  const data = res.data as { terms?: TermsVersion[] } | TermsVersion[] | null;
  if (Array.isArray(data)) return data;
  if (data !== null && typeof data === 'object' && Array.isArray(data.terms)) return data.terms;
  return [];
}

export async function getConsents(): Promise<ConsentRecord[]> {
  const res = await apiClient.get<ConsentRecord[]>('/api/v1/me/consents');
  return res.data;
}

export async function submitConsents(consents: ConsentInput[]): Promise<ConsentRecord[]> {
  const res = await apiClient.post<ConsentRecord[]>('/api/v1/me/consents', { consents });
  return res.data;
}
