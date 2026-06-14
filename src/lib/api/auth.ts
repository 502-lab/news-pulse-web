import { apiClient } from './client';
import type { components } from '../../../generated/api-types';

type AccountSummary = components['schemas']['AccountSummary'];
type TokenPair = components['schemas']['TokenPair'];

interface LoginResponse {
  account: AccountSummary;
  tokens: TokenPair;
}

interface RefreshResponse {
  tokens: TokenPair;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>('/api/v1/auth/login', { email, password });
  return res.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/api/v1/auth/logout', { refreshToken });
}

export async function refreshTokenApi(refreshToken: string): Promise<RefreshResponse> {
  const res = await apiClient.post<RefreshResponse>('/api/v1/auth/refresh', { refreshToken });
  return res.data;
}

export async function getMe(): Promise<AccountSummary> {
  const res = await apiClient.get<AccountSummary>('/api/v1/me');
  return res.data;
}
