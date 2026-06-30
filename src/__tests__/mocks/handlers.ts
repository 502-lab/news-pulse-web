import { http, HttpResponse } from "msw";

const BASE = "http://localhost:8080";

export const mockUser = {
  id: "test-uuid-001",
  email: "test@example.com",
  role: "USER" as const,
  emailVerified: true,
  onboardingCompleted: true,
  requiresReConsent: false,
  signupType: "EMAIL" as const,
  createdAt: "2026-01-01T00:00:00Z",
};

export const mockTokens = {
  accessToken: "mock-access-token",
  refreshToken: "mock-refresh-token",
  expiresIn: 3600,
};

export const handlers = [
  http.post(`${BASE}/api/v1/auth/login`, () =>
    HttpResponse.json({ account: mockUser, tokens: mockTokens }),
  ),

  http.post(`${BASE}/api/v1/auth/refresh`, () =>
    HttpResponse.json({
      tokens: {
        ...mockTokens,
        accessToken: "mock-access-token-refreshed",
        refreshToken: "mock-refresh-token-new",
      },
    }),
  ),

  http.post(
    `${BASE}/api/v1/auth/logout`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.get(`${BASE}/api/v1/me`, () => HttpResponse.json(mockUser)),
];
