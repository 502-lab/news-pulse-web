// ⚠️ 002 단계 전용 — 007에서 삭제

export interface AuthUser {
  id: string;
  nickname: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => void;
}

// ADMIN 라우팅 테스트 시 role을 'ADMIN'으로 변경
export const useAuthStore = (): AuthStore => ({
  user: {
    id: '1',
    nickname: '테스트유저',
    email: 'test@example.com',
    role: 'USER',
  },
  isLoading: false,
  logout: () => {},
});
