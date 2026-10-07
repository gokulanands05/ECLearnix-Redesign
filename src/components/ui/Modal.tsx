import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Dark header band (used for quiz / certificate) */
  tone?: 'light' | 'dark';
}

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, eyebrow, description, children, footer, size = 'md', tone = 'light' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const raf = requestAnimationFrame(() => {
      const el = panelRef.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade bg-ink/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'relative flex max-h-[92vh] w-full animate-pop flex-col overflow-hidden rounded-t-xl bg-page shadow-l sm:rounded-xl',
          size === 'sm' && 'sm:max-w-[440px]',
          size === 'md' && 'sm:max-w-[560px]',
          size === 'lg' && 'sm:max-w-[720px]',
        )}
      >
        <div className={cn('relative shrink-0 px-6 pt-6 pb-4 sm:px-7', tone === 'dark' && 'overflow-hidden bg-ink pb-6 text-white')}>
          {tone === 'dark' && <span aria-hidden className="absolute -top-10 right-[-30px] size-[120px] rounded-full bg-brand" />}
          <div className="relative pr-10">
            {eyebrow && <p className={cn('t-overline mb-2', tone === 'dark' ? 'text-highlight' : 'text-muted')}>{eyebrow}</p>}
            <h2 id={titleId} className={cn('t-heading-m', tone === 'dark' ? 'text-white' : 'text-ink')}>
              {title}
            </h2>
            {description && (
              <p id={descId} className={cn('t-body-m mt-2', tone === 'dark' ? 'text-on-dark-muted' : 'text-body')}>
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={cn(
              'absolute top-5 right-5 grid size-10 place-items-center rounded-sm transition-colors',
              tone === 'dark' ? 'text-white hover:bg-white/10' : 'text-body hover:bg-field hover:text-ink',
            )}
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        {children && <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 pb-6 sm:px-7', tone === 'dark' && 'pt-6')}>{children}</div>}
        {footer && <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line px-6 py-4 sm:px-7">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
