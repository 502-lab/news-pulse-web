import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "./setup";
import { useAuthStore } from "@/stores/authStore";
import {
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
} from "@/lib/tokenStorage";

const BASE = "http://localhost:8080";

const mockUser = {
  id: "u1",
  email: "test@example.com",
  role: "USER" as const,
  emailVerified: true,
  onboardingCompleted: true,
  requiresReConsent: false,
  signupType: "EMAIL" as const,
  createdAt: "2026-01-01T00:00:00Z",
};

// AuthProvider의 restoreSession 로직을 직접 테스트
async function runRestoreSession() {
  const { setAuth, setLoading } = useAuthStore.getState();
  const rt = getRefreshToken();
  if (!rt) {
    setLoading(false);
    return;
  }
  try {
    const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) throw new Error("refresh failed");
    const data = (await res.json()) as {
      tokens: { accessToken: string; refreshToken: string };
    };
    setRefreshToken(data.tokens.refreshToken);
    useAuthStore.getState().setAccessToken(data.tokens.accessToken);
    const meRes = await fetch(`${BASE}/api/v1/me`, {
      headers: { Authorization: `Bearer ${data.tokens.accessToken}` },
    });
    if (!meRes.ok) throw new Error("me failed");
    const user = (await meRes.json()) as typeof mockUser;
    setAuth(user, data.tokens.accessToken);
  } catch {
    clearRefreshToken();
  } finally {
    setLoading(false);
  }
}

describe("authStore — logout 액션 (S-7)", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, accessToken: null, isLoading: false });
  });

  it("logout() → user=null, accessToken=null, refreshToken 삭제", () => {
    setRefreshToken("some-rt");
    useAuthStore.setState({
      user: mockUser,
      accessToken: "some-tok",
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});

describe("authStore — session restore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, accessToken: null, isLoading: true });
  });

  it("refreshToken 없으면 isLoading=false, user=null 유지", async () => {
    await runRestoreSession();

    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.user).toBeNull();
  });

  it("refreshToken 있고 갱신 성공 → user 설정, isLoading=false", async () => {
    setRefreshToken("valid-rt");

    await runRestoreSession();

    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe("test@example.com");
  });

  it("refreshToken 있고 갱신 실패 → user=null, isLoading=false, localStorage 정리", async () => {
    setRefreshToken("expired-rt");

    server.use(
      http.post(
        `${BASE}/api/v1/auth/refresh`,
        () => new HttpResponse(null, { status: 401 }),
      ),
    );

    await runRestoreSession();

    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.user).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
