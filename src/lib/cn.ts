import { twMerge } from 'tailwind-merge';

/** Join class names and let later Tailwind utilities override earlier conflicting ones. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return twMerge(parts.filter(Boolean).join(' '));
}
