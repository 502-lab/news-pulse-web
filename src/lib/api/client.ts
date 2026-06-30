import axios, { type AxiosResponse } from "axios";
import { useAuthStore } from "@/stores/authStore";
import {
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
} from "@/lib/tokenStorage";

type ApiWrapper = {
  code: number;
  status: string;
  message: string;
  data: unknown;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

const EMAIL_VERIFY_PATHS = [
  "/api/v1/auth/email-verification/request",
  "/api/v1/auth/email-verification/verify",
];

// Request: accessToken 헤더 주입 (email-verification은 pendingToken 사용)
apiClient.interceptors.request.use((config) => {
  const { accessToken, pendingToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else if (
    pendingToken &&
    config.url &&
    EMAIL_VERIFY_PATHS.some((p) => config.url!.includes(p))
  ) {
    config.headers.Authorization = `Bearer ${pendingToken}`;
  }
  return config;
});

// auth 엔드포인트 여부: /auth/ 하위 경로 중 /refresh를 제외한 모든 경로
// (login·signup·email-verify·password-reset·social 등 401은 세션 만료가 아닌 정상 거부)
function isAuthOnlyEndpoint(url?: string): boolean {
  return (
    !!url &&
    url.includes("/api/v1/auth/") &&
    !url.includes("/api/v1/auth/refresh")
  );
}

// 401 갱신 큐 — 단일 탭 내 동시 401 처리 (크로스탭 동기화는 후속 과제)
let isRefreshing = false;
type QueueEntry = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};
const pendingQueue: QueueEntry[] = [];

function drainQueue(token: string | null, err: unknown) {
  pendingQueue.forEach((entry) => {
    if (token) entry.resolve(token);
    else entry.reject(err);
  });
  pendingQueue.length = 0;
}

apiClient.interceptors.response.use(
  (res) => {
    // Auto-unwrap ApiResponse<T> wrapper: { code, status, message, data }
    if (
      res.data !== null &&
      typeof res.data === "object" &&
      "code" in res.data &&
      "data" in res.data
    ) {
      res.data = (res.data as ApiWrapper).data;
    }
    return res;
  },
  async (error: unknown) => {
    const axiosError = error as {
      response?: AxiosResponse;
      config?: {
        _retry?: boolean;
        url?: string;
        headers: Record<string, string>;
      };
    };
    const isRefreshEndpoint = axiosError.config?.url?.includes("/auth/refresh");
    if (
      axiosError.response?.status !== 401 ||
      axiosError.config?._retry ||
      isRefreshEndpoint ||
      isAuthOnlyEndpoint(axiosError.config?.url)
    ) {
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
      if (!rt) throw new Error("no refresh token");

      const res = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
      }>("/api/v1/auth/refresh", { refreshToken: rt });

      const { accessToken: newAT, refreshToken: newRT } = res.data;
      useAuthStore.getState().setAccessToken(newAT);
      setRefreshToken(newRT);
      drainQueue(newAT, null);

      originalConfig.headers.Authorization = `Bearer ${newAT}`;
      return apiClient(originalConfig);
    } catch (refreshError) {
      drainQueue(null, refreshError);
      useAuthStore.getState().clearAuth();
      clearRefreshToken();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
