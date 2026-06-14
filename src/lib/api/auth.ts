import { apiClient } from './client';
import type { components } from '../../../generated/api-types';

type AccountSummary = components['schemas']['AccountSummary'];
type TokenPair = components['schemas']['TokenPair'];
type SignupRequest = components['schemas']['SignupRequest'];
type EmailVerificationVerifyRequest = components['schemas']['EmailVerificationVerifyRequest'];

interface AuthResponse {
  account: AccountSummary;
  tokens: TokenPair;
}

interface RefreshResponse {
  tokens: TokenPair;
}

interface EmailVerifyResponse {
  emailVerified?: boolean;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/api/v1/auth/login', { email, password });
  return res.data;
}

export async function signup(body: SignupRequest): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/api/v1/auth/signup', body);
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

export async function requestEmailVerification(email: string): Promise<void> {
  await apiClient.post('/api/v1/auth/email-verification/request', { email });
}

export async function verifyEmail(
  body: EmailVerificationVerifyRequest,
): Promise<EmailVerifyResponse> {
  const res = await apiClient.post<EmailVerifyResponse>(
    '/api/v1/auth/email-verification/verify',
    body,
  );
  return res.data;
}
