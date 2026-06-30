export interface ToastOptions {
  icon?: string;
  tone?: "ok" | "brand";
}

export const listeners = new Set<(msg: string, opts: ToastOptions) => void>();

export function showToast(msg: string, opts: ToastOptions = {}) {
  listeners.forEach((fn) => fn(msg, opts));
}
