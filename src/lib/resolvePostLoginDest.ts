import type { AuthUser } from "@/stores/authStore";

// 인증·게스트 전용 경로는 returnTo로 허용하지 않음 (리다이렉트 루프 차단)
const BLOCKED_RETURN_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/re-consent",
  "/social-consent",
  "/onboarding",
  "/oauth",
];

function isSafeReturnTo(path: string): boolean {
  if (!path.startsWith("/")) return false; // 외부 URL·javascript: 차단
  return !BLOCKED_RETURN_PREFIXES.some(
    (prefix) =>
      path === prefix ||
      path.startsWith(`${prefix}/`) ||
      path.startsWith(`${prefix}?`),
  );
}

/**
 * 로그인·소셜 인증 성공 후 이동할 경로를 결정한다.
 * GuestOnlyRoute와 LoginForm이 동일 함수를 사용해 목적지 드리프트를 방지한다.
 */
export function resolvePostLoginDest(
  user: AuthUser,
  locationState: unknown,
): string {
  const roleHome = user.role === "ADMIN" ? "/admin" : "/home";
  const state = locationState as { returnTo?: string } | null;
  const returnTo = state?.returnTo;
  if (returnTo && isSafeReturnTo(returnTo)) {
    return returnTo;
  }
  return roleHome;
}
