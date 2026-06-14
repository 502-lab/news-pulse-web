import axios, { type AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { getRefreshToken, setRefreshToken, clearRefreshToken } from '@/lib/tokenStorage';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request: accessToken 헤더 주입
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 갱신 큐 — 단일 탭 내 동시 401 처리 (크로스탭 동기화는 후속 과제)
let isRefreshing = false;
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
const pendingQueue: QueueEntry[] = [];

function drainQueue(token: string | null, err: unknown) {
  pendingQueue.forEach((entry) => {
    if (token) entry.resolve(token);
    else entry.reject(err);
  });
  pendingQueue.length = 0;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: unknown) => {
    const axiosError = error as { response?: AxiosResponse; config?: { _retry?: boolean; url?: string; headers: Record<string, string> } };
    const isRefreshEndpoint = axiosError.config?.url?.includes('/auth/refresh');
    if (axiosError.response?.status !== 401 || axiosError.config?._retry || isRefreshEndpoint) {
      return Promise.reject(error);
    }

    const originalConfig = axiosError.config!;
    originalConfig._retry = true;

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalConfig);
      });
    }

    isRefreshing = true;

    try {
      const rt = getRefreshToken();
      if (!rt) throw new Error('no refresh token');

      const res = await apiClient.post<{ tokens: { accessToken: string; refreshToken: string } }>(
        '/api/v1/auth/refresh',
        { refreshToken: rt },
      );

      const { accessToken: newAT, refreshToken: newRT } = res.data.tokens;
      useAuthStore.getState().setAccessToken(newAT);
      setRefreshToken(newRT);
      drainQueue(newAT, null);

      originalConfig.headers.Authorization = `Bearer ${newAT}`;
      return apiClient(originalConfig);
    } catch (refreshError) {
      drainQueue(null, refreshError);
      useAuthStore.getState().clearAuth();
      clearRefreshToken();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
