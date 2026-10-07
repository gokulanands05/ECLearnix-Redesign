import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

type Placement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  placement?: Placement;
  offset?: number;
  /** Match the anchor's width (used by search suggestions) */
  matchWidth?: boolean;
  className?: string;
  children: ReactNode;
  role?: string;
  id?: string;
  /** Don't move focus into the popover on open (e.g. search keeps focus in the input) */
  keepFocus?: boolean;
  label?: string;
}

/**
 * Floating panel rendered in a portal so it is never clipped by overflow parents.
 * Closes on outside click and Escape, repositions on scroll/resize.
 */
export function Popover({
  open,
  onClose,
  anchorRef,
  placement = 'bottom-start',
  offset = 8,
  matchWidth,
  className,
  children,
  role = 'dialog',
  id,
  keepFocus,
  label,
}: PopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width?: number } | null>(null);

  const place = useCallback(() => {
    const a = anchorRef.current;
    const p = panelRef.current;
    if (!a || !p) return;
    const r = a.getBoundingClientRect();
    const pw = matchWidth ? r.width : p.offsetWidth;
    const ph = p.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let top = placement.startsWith('top') ? r.top - ph - offset : r.bottom + offset;
    // flip vertically if it would overflow
    if (placement.startsWith('bottom') && top + ph > vh - 8 && r.top - ph - offset > 8) top = r.top - ph - offset;
    if (placement.startsWith('top') && top < 8) top = r.bottom + offset;
    let left = placement.endsWith('end') ? r.right - pw : r.left;
    left = Math.min(Math.max(8, left), vw - pw - 8);
    setPos({ top, left, width: matchWidth ? r.width : undefined });
  }, [anchorRef, placement, offset, matchWidth]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        anchorRef.current?.focus();
      }
    };
    const onMove = () => place();
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, onClose, anchorRef, place]);

  useEffect(() => {
    if (!open || keepFocus) return;
    const id = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        '[data-autofocus], [role="menuitem"], [role="option"], button, a[href], input, textarea, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open, keepFocus]);

  if (!open) return null;
  return createPortal(
    <div
      ref={panelRef}
      id={id}
      role={role}
      aria-label={label}
      style={{ position: 'fixed', top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: pos?.width }}
      className={cn(
        'z-[60] rounded-md border border-line bg-page shadow-pop',
        pos ? 'animate-pop' : 'invisible',
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}

/** Arrow-key navigation for role="menu" containers */
export function handleMenuKeys(e: React.KeyboardEvent<HTMLElement>) {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
  const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemradio"], [role="option"]'));
  if (!items.length) return;
  e.preventDefault();
  const i = items.indexOf(document.activeElement as HTMLElement);
  const next =
    e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
  items[next].focus();
}
