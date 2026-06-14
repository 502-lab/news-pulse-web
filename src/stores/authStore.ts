import { create } from 'zustand';
import type { components } from '../../generated/api-types';
import { clearRefreshToken } from '@/lib/tokenStorage';

export type AuthUser = components['schemas']['AccountSummary'];

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    clearRefreshToken();
    set({ user: null, accessToken: null });
  },
}));
