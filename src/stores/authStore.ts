import { create } from "zustand";
import type { AccountSummary } from "@/lib/api/auth";
import { clearRefreshToken } from "@/lib/tokenStorage";

export type AuthUser = AccountSummary;

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  pendingToken: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  setPendingToken: (token: string) => void;
  clearPendingToken: () => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  pendingToken: null,
  isLoading: true,
  setAuth: (user, accessToken) =>
    set({ user, accessToken, pendingToken: null }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setPendingToken: (pendingToken) => set({ pendingToken }),
  clearPendingToken: () => set({ pendingToken: null }),
  clearAuth: () => set({ user: null, accessToken: null, pendingToken: null }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    clearRefreshToken();
    set({ user: null, accessToken: null, pendingToken: null });
  },
}));
