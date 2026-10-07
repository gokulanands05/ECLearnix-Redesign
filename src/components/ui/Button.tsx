import { LoaderCircle } from 'lucide-react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'highlight' | 'ghost';
export type ButtonSize = 'lg' | 'md';

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover active:bg-[#3123d6] disabled:bg-brand/45',
  secondary:
    'bg-page text-ink border-[1.5px] border-line-strong hover:bg-subtle hover:border-[#d3cfe6] active:bg-field disabled:text-muted disabled:bg-page',
  dark: 'bg-ink text-white hover:bg-ink-raised active:bg-black disabled:opacity-50',
  highlight: 'bg-highlight text-ink hover:bg-highlight-hover active:bg-[#bde22e] disabled:opacity-50',
  ghost: 'bg-transparent text-ink hover:bg-field',
};

const sizeClass: Record<ButtonSize, string> = {
  lg: 'h-14 px-6 gap-3 rounded-md t-label-l',
  md: 'h-11 px-[18px] gap-2 rounded-sm t-label-m',
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leading?: ReactNode;
  trailing?: ReactNode;
  loading?: boolean;
  pill?: boolean;
  block?: boolean;
  className?: string;
  children?: ReactNode;
}

type AsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined; ref?: Ref<HTMLButtonElement> };
type AsLink = CommonProps & { to: string; href?: undefined; onClick?: () => void; 'aria-label'?: string };
type AsAnchor = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined };

export type ButtonProps = AsButton | AsLink | AsAnchor;

export function buttonClasses({ variant = 'primary', size = 'md', pill, block, className }: CommonProps) {
  return cn(
    'relative inline-flex shrink-0 items-center justify-center whitespace-nowrap select-none transition-colors duration-150',
    variantClass[variant],
    sizeClass[size],
    pill && 'rounded-xl',
    block && 'w-full',
    className,
  );
}

export function Button(props: ButtonProps) {
  const { variant, size, leading, trailing, loading, pill, block, className, children, ...rest } = props as CommonProps &
    Record<string, unknown>;
  const cls = buttonClasses({ variant, size, pill, block, className });
  const content = (
    <>
      {loading ? <LoaderCircle className="animate-spin" size={size === 'lg' ? 20 : 18} aria-hidden /> : leading}
      {children}
      {!loading && trailing}
    </>
  );

  if ('to' in props && props.to) {
    const { to, ...linkRest } = rest as { to: string };
    return (
      <Link to={to} className={cls} {...linkRest}>
        {content}
      </Link>
    );
  }
  if ('href' in props && props.href) {
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }
  const btn = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={btn.type ?? 'button'} className={cls} aria-busy={loading || undefined} {...btn} disabled={btn.disabled || loading}>
      {content}
    </button>
  );
}

/** Square icon-only button (44×44 secondary, used for "Previous lesson", bell etc.) */
export function IconButton({
  label,
  children,
  className,
  variant = 'plain',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; variant?: 'plain' | 'outline' | 'onDark' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'relative grid size-11 shrink-0 place-items-center transition-colors duration-150',
        variant === 'plain' && 'rounded-md text-ink hover:bg-field aria-expanded:bg-field',
        variant === 'outline' && 'rounded-sm border-[1.5px] border-line-strong bg-page text-ink hover:bg-subtle disabled:text-muted disabled:hover:bg-page',
        variant === 'onDark' && 'size-9 rounded-sm text-white hover:bg-white/10 aria-pressed:bg-white/15',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
