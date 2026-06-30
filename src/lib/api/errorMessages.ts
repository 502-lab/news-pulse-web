export const AUTH_ERROR_MESSAGES: Record<number, string> = {
  401: "이메일 또는 비밀번호가 올바르지 않습니다.",
  409: "이미 사용 중인 이메일입니다.",
  422: "입력한 정보를 다시 확인해주세요.",
  429: "잠시 후 다시 시도해주세요.",
  500: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

export const NETWORK_ERROR_MESSAGE =
  "네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요.";

export function getAuthErrorMessage(status?: number): string {
  if (status === undefined) return NETWORK_ERROR_MESSAGE;
  return AUTH_ERROR_MESSAGES[status] ?? AUTH_ERROR_MESSAGES[500];
}
