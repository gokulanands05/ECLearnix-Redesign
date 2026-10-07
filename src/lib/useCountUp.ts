import { useEffect, useRef, useState } from 'react';

/** Counts from 0 to `target` once the element scrolls into view. */
export function useCountUp<T extends HTMLElement>(target: number, duration = 1200) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(target);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    setValue(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, value };
}

/** Indian digit grouping, e.g. 500000 → 5,00,000 */
export const formatIN = (n: number) => n.toLocaleString('en-IN');
