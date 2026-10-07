import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

type Tone = 'success' | 'info' | 'error';
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
  action?: { label: string; onClick: () => void };
}

interface ToastApi {
  show: (message: string, opts?: { tone?: Tone; action?: ToastItem['action'] }) => void;
}

const Ctx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);

  const show = useCallback<ToastApi['show']>(
    (message, opts) => {
      const id = nextId.current++;
      setItems((all) => [...all.slice(-2), { id, message, tone: opts?.tone ?? 'success', action: opts?.action }]);
      window.setTimeout(() => dismiss(id), 3800);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4"
      >
        {items.map((t) => {
          const Icon = t.tone === 'success' ? CircleCheck : t.tone === 'error' ? CircleAlert : Info;
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex max-w-[480px] animate-toast items-center gap-3 rounded-md bg-ink py-3 pr-3 pl-4 text-white shadow-l"
            >
              <Icon
                size={18}
                strokeWidth={2.25}
                className={t.tone === 'success' ? 'text-highlight' : t.tone === 'error' ? 'text-coral' : 'text-brand-soft'}
                aria-hidden
              />
              <p className="t-label-m">{t.message}</p>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="t-label-m rounded-sm px-2 py-1 text-highlight hover:bg-white/10"
                >
                  {t.action.label}
                </button>
              )}
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="grid size-7 place-items-center rounded-sm text-on-dark-muted hover:bg-white/10 hover:text-white"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
