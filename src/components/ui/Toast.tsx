import { useState, useEffect } from 'react';
import Icon from './Icon';

interface ToastOptions {
  icon?: string;
  tone?: 'ok' | 'brand';
}

interface ToastItem {
  id: number;
  msg: string;
  icon: string;
  tone: 'ok' | 'brand';
}

const listeners = new Set<(msg: string, opts: ToastOptions) => void>();

export function showToast(msg: string, opts: ToastOptions = {}) {
  listeners.forEach((fn) => fn(msg, opts));
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const fn = (msg: string, opts: ToastOptions) => {
      const id = Date.now() + Math.random();
      setItems((list) => [
        ...list,
        { id, msg, icon: opts.icon ?? 'check', tone: opts.tone ?? 'ok' },
      ]);
      setTimeout(
        () => setItems((list) => list.filter((t) => t.id !== id)),
        2200,
      );
    };
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] flex flex-col items-center gap-2 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className="fadeup inline-flex items-center gap-2 bg-navy text-white text-[13px] font-semibold px-4 py-2.5 rounded-full shadow-pop"
        >
          <Icon
            name={t.icon}
            size={15}
            className={t.tone === 'brand' ? 'text-brand-100' : 'text-ok'}
          />
          {t.msg}
        </div>
      ))}
    </div>
  );
}
