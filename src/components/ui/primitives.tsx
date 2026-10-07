import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import googleMark from '../../assets/google-mark.svg';
import logoMark from '../../assets/logo-mark.svg';
import { cn } from '../../lib/cn';

/* ---------- Logo (Default / Inverse) ---------- */
export function Logo({ tone = 'default', to = '/', className }: { tone?: 'default' | 'inverse'; to?: string | null; className?: string }) {
  const inner = (
    <>
      <img src={logoMark} alt="" width={34} height={34} className="size-[34px] shrink-0" />
      <span className={cn('t-wordmark whitespace-nowrap', tone === 'inverse' ? 'text-white' : 'text-ink')}>ECLearnix</span>
    </>
  );
  const cls = cn('inline-flex items-center gap-2.5', tone === 'inverse' && 'rounded-sm bg-ink py-2 pr-3 pl-2', className);
  if (to === null) return <span className={cls}>{inner}</span>;
  return (
    <Link to={to} className={cls} aria-label="ECLearnix home">
      {inner}
    </Link>
  );
}

/* ---------- Chip (Default / Selected) ---------- */
export function Chip({
  selected,
  children,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        't-label-m inline-flex h-[38px] shrink-0 items-center rounded-full px-4 whitespace-nowrap transition-colors duration-150',
        selected ? 'bg-ink text-white' : 'bg-field text-ink hover:bg-lavender',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------- Badge ---------- */
const badgeTints = {
  highlight: 'bg-highlight',
  lavender: 'bg-lavender',
  peach: 'bg-peach',
  butter: 'bg-butter',
  mint: 'bg-mint',
} as const;
export function Badge({ children, tint = 'highlight', className }: { children: ReactNode; tint?: keyof typeof badgeTints; className?: string }) {
  return <span className={cn('t-overline inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-ink', badgeTints[tint], className)}>{children}</span>;
}

/* ---------- Avatar (initials or photo) ---------- */
export function Avatar({
  initials,
  src,
  tint = 'bg-peach',
  className,
  imgClassName,
}: {
  initials?: string;
  src?: string;
  tint?: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span
      className={cn(
        't-label-m relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-page text-ink',
        tint,
        className,
      )}
    >
      {src ? <img src={src} alt="" className={cn('absolute max-w-none', imgClassName ?? 'inset-0 size-full object-cover')} /> : initials}
    </span>
  );
}

/* ---------- Progress bar ---------- */
export function Progress({ value, className, label }: { value: number; className?: string; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-line', className)}
    >
      <div className="absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${v}%` }} />
    </div>
  );
}

/* ---------- Progress ring (Weekly goal) ---------- */
export function ProgressRing({ value, max, size = 96, stroke = 10, children }: { value: number; max: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, max ? value / max : 0);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/* ---------- Brand marks ---------- */
export function GoogleMark({ className }: { className?: string }) {
  return <img src={googleMark} alt="" width={24} height={24} className={cn('size-6', className)} />;
}

export function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={24} height={24} className={cn('size-6', className)} aria-hidden>
      <rect width="24" height="24" rx="3" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M7.1 9.5H4.6V19h2.5V9.5zM5.86 5A1.45 1.45 0 1 0 5.86 7.9 1.45 1.45 0 0 0 5.86 5zM19.4 13.6c0-2.6-1.4-4.3-3.7-4.3-1.3 0-2.1.7-2.5 1.3V9.5h-2.4V19h2.5v-4.9c0-1.3.6-2.2 1.8-2.2 1.1 0 1.7.8 1.7 2.2V19h2.6v-5.4z"
      />
    </svg>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: ReactNode;
  title: string;
  body: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center rounded-lg border border-dashed border-line-strong bg-page px-6 py-10 text-center', className)}>
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-brand-tint text-brand">{icon}</div>
      <p className="t-heading-s text-ink">{title}</p>
      <p className="t-body-s mt-1.5 max-w-[340px] text-body">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Text link button ---------- */
export function LinkButton({ children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn('t-label-m rounded-[4px] text-brand underline-offset-4 transition-colors hover:text-brand-hover hover:underline', className)}
      {...rest}
    >
      {children}
    </button>
  );
}
