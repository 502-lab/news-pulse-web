import { useEffect, type ReactNode } from "react";
import {
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
} from "@/lib/tokenStorage";
import { refreshTokenApi, getMe } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    async function restoreSession() {
      const rt = getRefreshToken();
      if (!rt) {
        setLoading(false);
        return;
      }

      try {
        const tokens = await refreshTokenApi(rt);
        setRefreshToken(tokens.refreshToken);
        // accessToken을 스토어에 먼저 설정해야 getMe() 요청에 헤더가 붙음
        useAuthStore.getState().setAccessToken(tokens.accessToken);
        const user = await getMe();
        setAuth(user, tokens.accessToken);
      } catch {
        clearRefreshToken();
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, [setAuth, setLoading]);

  return <>{children}</>;
}
