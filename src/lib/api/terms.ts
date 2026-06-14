import { apiClient } from './client';
import type { components } from '../../../generated/api-types';

type TermsVersion = components['schemas']['TermsVersion'];
type ConsentInput = components['schemas']['ConsentInput'];
type ConsentRecord = components['schemas']['ConsentRecord'];

export const TERMS_QUERY_KEYS = {
  activeTerms: ['terms', 'active'] as const,
  myConsents: ['me', 'consents'] as const,
};

export async function getActiveTerms(): Promise<TermsVersion[]> {
  const res = await apiClient.get<TermsVersion[]>('/api/v1/terms');
  return res.data;
}

export async function getConsents(): Promise<ConsentRecord[]> {
  const res = await apiClient.get<ConsentRecord[]>('/api/v1/me/consents');
  return res.data;
}

export async function submitConsents(consents: ConsentInput[]): Promise<ConsentRecord[]> {
  const res = await apiClient.post<ConsentRecord[]>('/api/v1/me/consents', { consents });
  return res.data;
}
