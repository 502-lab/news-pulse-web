import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './setup';
import { useAuthStore } from '@/stores/authStore';
import { setRefreshToken, getRefreshToken } from '@/lib/tokenStorage';
import { apiClient } from '@/lib/api/client';

const BASE = 'http://localhost:8080';

describe('401 갱신 큐 인터셉터', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, accessToken: 'expired-token', isLoading: false });
    setRefreshToken('valid-rt');
  });

  it('단일 401 → 갱신 성공 → 새 토큰이 스토어에 저장됨', async () => {
    let refreshCallCount = 0;

    server.use(
      http.get(`${BASE}/api/v1/me`, ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth !== 'Bearer new-access') return new HttpResponse(null, { status: 401 });
        return HttpResponse.json({ id: 'u1', email: 'test@example.com', role: 'USER' });
      }),
      http.post(`${BASE}/api/v1/auth/refresh`, () => {
        refreshCallCount++;
        return HttpResponse.json({
          tokens: { accessToken: 'new-access', refreshToken: 'new-refresh', expiresIn: 3600 },
        });
      }),
    );

    await apiClient.get('/api/v1/me');

    expect(useAuthStore.getState().accessToken).toBe('new-access');
    expect(getRefreshToken()).toBe('new-refresh');
    expect(refreshCallCount).toBe(1);
  });

  it('동시 3개 401 → POST /auth/refresh 1회만 호출 → 3개 재시도 완료', async () => {
    let refreshCallCount = 0;

    server.use(
      http.get(`${BASE}/api/v1/test`, ({ request }) => {
        const auth = request.headers.get('Authorization');
        if (auth !== 'Bearer new-access-concurrent') return new HttpResponse(null, { status: 401 });
        return HttpResponse.json({ ok: true });
      }),
      http.post(`${BASE}/api/v1/auth/refresh`, async () => {
        refreshCallCount++;
        await new Promise((r) => setTimeout(r, 20));
        return HttpResponse.json({
          tokens: { accessToken: 'new-access-concurrent', refreshToken: 'new-refresh-2', expiresIn: 3600 },
        });
      }),
    );

    const [r1, r2, r3] = await Promise.all([
      apiClient.get('/api/v1/test'),
      apiClient.get('/api/v1/test'),
      apiClient.get('/api/v1/test'),
    ]);

    expect(refreshCallCount).toBe(1);
    expect(r1.data).toEqual({ ok: true });
    expect(r2.data).toEqual({ ok: true });
    expect(r3.data).toEqual({ ok: true });
  });

  it('갱신 API 실패 → clearAuth 호출, localStorage 정리', async () => {
    server.use(
      http.get(`${BASE}/api/v1/me`, () => new HttpResponse(null, { status: 401 })),
      // /auth/refresh 자체가 401 → isRefreshEndpoint 체크로 재진입 차단 후 catch 블록 도달
      http.post(`${BASE}/api/v1/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
    );

    try {
      await apiClient.get('/api/v1/me');
    } catch {
      // 갱신 실패 시 에러 throw 정상
    }

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('동시 3개 401 + 갱신 실패 → pendingQueue 전체 reject + clearAuth + localStorage 정리', async () => {
    // 첫 번째 요청이 refresh를 시작하는 동안 나머지 2개가 pendingQueue에 쌓임
    // refresh 실패 시 drainQueue(null, err)로 전체 reject 되어야 함
    server.use(
      http.get(`${BASE}/api/v1/concurrent-fail`, () => new HttpResponse(null, { status: 401 })),
      http.post(`${BASE}/api/v1/auth/refresh`, async () => {
        await new Promise((r) => setTimeout(r, 20)); // 다른 요청이 큐에 쌓일 시간
        return new HttpResponse(null, { status: 401 });
      }),
    );

    const results = await Promise.allSettled([
      apiClient.get('/api/v1/concurrent-fail'),
      apiClient.get('/api/v1/concurrent-fail'),
      apiClient.get('/api/v1/concurrent-fail'),
    ]);

    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
