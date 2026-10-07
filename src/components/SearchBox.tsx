import { ArrowUpRight, BookOpen, CalendarDays, Search, X } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { courses, type CatalogCourse } from '../data/courses';
import { events } from '../data/events';
import type { LiveEvent } from '../data/types';
import { cn } from '../lib/cn';
import { Popover } from './ui/Popover';

type Result = { type: 'course'; item: CatalogCourse } | { type: 'event'; item: LiveEvent };

const popular = ['Research methodology', 'Paper writing', 'UI/UX', 'Hackathon'];

interface SearchBoxProps {
  variant: 'outline' | 'filled';
  className?: string;
  onSelectCourse: (course: CatalogCourse) => void;
  onSelectEvent?: (event: LiveEvent) => void;
}

export function SearchBox({ variant, className, onSelectCourse, onSelectEvent }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results: Result[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const words = q.split(/\s+/);
    const match = (s: string) => words.every((w) => s.toLowerCase().includes(w));
    const c = courses.filter((x) => match(`${x.title} ${x.area} ${x.pathMeta}`)).map((item) => ({ type: 'course' as const, item }));
    const e = onSelectEvent ? events.filter((x) => match(`${x.title} ${x.subtitle} ${x.tag}`)).map((item) => ({ type: 'event' as const, item })) : [];
    return [...c.slice(0, 5), ...e.slice(0, 3)];
  }, [query, onSelectEvent]);

  const choose = (r: Result) => {
    setOpen(false);
    setQuery('');
    if (r.type === 'course') onSelectCourse(r.item);
    else onSelectEvent?.(r.item);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      if (query) setQuery('');
      else setOpen(false);
    }
  };

  return (
    <>
      <div
        ref={wrapRef}
        className={cn(
          'group flex h-[46px] min-w-0 items-center gap-2.5 rounded-sm px-4 transition-[border-color,box-shadow,background] duration-150',
          variant === 'outline'
            ? 'border-[1.5px] border-line-strong bg-page focus-within:border-brand hover:border-[#cfcae4]'
            : 'bg-field focus-within:bg-page focus-within:shadow-[0_0_0_1.5px_var(--color-brand)]',
          className,
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <Search size={18} strokeWidth={2} className="shrink-0 text-ink" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
          aria-label="Search courses and events"
          placeholder="What do you want to learn today?"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="t-body-m min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              inputRef.current?.focus();
            }}
            className="grid size-7 place-items-center rounded-full text-muted hover:bg-line hover:text-ink"
          >
            <X size={16} aria-hidden />
          </button>
        )}
      </div>

      <Popover open={open} onClose={() => setOpen(false)} anchorRef={wrapRef} matchWidth keepFocus role="presentation" className="p-2">
        <div id={listId} role="listbox" aria-label="Search suggestions">
          {!query.trim() ? (
            <div className="p-2">
              <p className="t-overline mb-2.5 text-muted">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {popular.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setQuery(p);
                      inputRef.current?.focus();
                    }}
                    className="t-label-s rounded-full bg-field px-3 py-1.5 text-ink hover:bg-lavender"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="t-label-l text-ink">No results for “{query.trim()}”</p>
              <p className="t-body-s mt-1 text-body">Try “research”, “writing” or “design”.</p>
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={`${r.type}-${r.item.id}`}
                id={`${listId}-${i}`}
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(r)}
                className={cn('flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left', i === active && 'bg-brand-tint')}
              >
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-sm',
                    r.type === 'course' ? 'bg-lavender text-brand' : 'bg-peach text-streak',
                  )}
                >
                  {r.type === 'course' ? <BookOpen size={17} aria-hidden /> : <CalendarDays size={17} aria-hidden />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="t-label-m block truncate text-ink">{r.item.title}</span>
                  <span className="t-label-s block truncate text-muted">
                    {r.type === 'course' ? `ECLearnix · ${r.item.area}` : `${r.item.day} ${r.item.month} · ${r.item.subtitle}`}
                  </span>
                </span>
                <ArrowUpRight size={16} className="shrink-0 text-muted" aria-hidden />
              </button>
            ))
          )}
        </div>
      </Popover>
    </>
  );
}
