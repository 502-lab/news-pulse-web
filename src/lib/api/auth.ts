import { apiClient } from './client';
import type { components } from '../../../generated/api-types';

type AccountSummary = components['schemas']['AccountSummary'];
type TokenPair = components['schemas']['TokenPair'];
type SignupRequest = components['schemas']['SignupRequest'];
type EmailVerificationVerifyRequest = components['schemas']['EmailVerificationVerifyRequest'];
type SocialAuthorizeResponse = components['schemas']['SocialAuthorizeResponse'];
type SocialCallbackRequest = components['schemas']['SocialCallbackRequest'];
type SocialPendingSignupResponse = components['schemas']['SocialPendingSignupResponse'];
type SocialCompleteRequest = components['schemas']['SocialCompleteRequest'];

export type { SocialPendingSignupResponse, SocialCompleteRequest };

type SocialProvider = 'kakao' | 'google' | 'apple';

type SocialCallbackSuccessResponse = {
  isNew: false;
  account: AccountSummary;
  tokens: TokenPair;
};

export type SocialCallbackResponse = SocialCallbackSuccessResponse | (SocialPendingSignupResponse & { isNew: true });

type PasswordResetVerifyResponse = components['schemas']['PasswordResetVerifyResponse'];

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

// T013: 비밀번호 재설정 API (경로·타입 모두 generated/api-types.ts 기준)

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post('/api/v1/auth/password-reset/request', { email });
}

export async function verifyPasswordResetCode(
  email: string,
  code: string,
): Promise<PasswordResetVerifyResponse> {
  const res = await apiClient.post<PasswordResetVerifyResponse>(
    '/api/v1/auth/password-reset/verify',
    { email, code },
  );
  return res.data;
}

export async function confirmPasswordReset(
  resetToken: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post('/api/v1/auth/password-reset/confirm', { resetToken, newPassword });
}

// T017: 소셜 로그인 API (경로·타입 모두 generated/api-types.ts 기준)

export async function getSocialAuthorizeUrl(
  provider: SocialProvider,
  redirectUri: string,
): Promise<SocialAuthorizeResponse> {
  const res = await apiClient.get<SocialAuthorizeResponse>(
    `/api/v1/auth/social/${provider}/authorize`,
    { params: { redirectUri } },
  );
  return res.data;
}

export async function handleSocialCallback(
  provider: SocialProvider,
  body: SocialCallbackRequest,
): Promise<SocialCallbackResponse> {
  const res = await apiClient.post<SocialCallbackResponse>(
    `/api/v1/auth/social/${provider}/callback`,
    body,
    { validateStatus: (s) => s === 200 || s === 202 },
  );
  return res.data;
}

export async function completeSocialSignup(
  body: SocialCompleteRequest,
): Promise<{ account: AccountSummary; tokens: TokenPair }> {
  const res = await apiClient.post<{ account: AccountSummary; tokens: TokenPair }>(
    '/api/v1/auth/social/complete',
    body,
  );
  return res.data;
}
