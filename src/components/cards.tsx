import {
  Award,
  Bookmark,
  BookOpen,
  Briefcase,
  Check,
  Code,
  FlaskConical,
  GraduationCap,
  LayoutTemplate,
  Lock,
  PenLine,
  Play,
  Presentation,
  Search,
  Sparkle,
  Trophy,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { CatalogCourse } from '../data/courses';
import type { LiveEvent } from '../data/types';
import { cn } from '../lib/cn';
import { Button } from './ui/Button';
import { Badge, Progress } from './ui/primitives';

/* ---------------- Topic / selectable card (onboarding) ---------------- */
const topicIcons = {
  flask: FlaskConical,
  pen: PenLine,
  book: BookOpen,
  search: Search,
  layout: LayoutTemplate,
  code: Code,
  trophy: Trophy,
  sparkle: Sparkle,
  graduation: GraduationCap,
  presentation: Presentation,
  briefcase: Briefcase,
};
export type TopicIconName = keyof typeof topicIcons;

export function TopicCard({
  icon,
  tile,
  iconColor,
  title,
  description,
  selected,
  onToggle,
  mode = 'checkbox',
  className,
}: {
  icon?: TopicIconName;
  tile: string;
  iconColor?: string;
  title: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
  mode?: 'checkbox' | 'radio';
  className?: string;
  tileContent?: ReactNode;
}) {
  const Icon = icon ? topicIcons[icon] : null;
  return (
    <button
      type="button"
      role={mode}
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        'group relative flex min-h-[174px] w-full flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-[background,border-color,transform] duration-150 active:scale-[0.985]',
        selected ? 'border-brand bg-brand-tint' : 'border-line bg-page hover:border-line-strong hover:bg-subtle',
        className,
      )}
    >
      <span className={cn('grid size-[42px] shrink-0 place-items-center rounded-sm', tile)}>
        {Icon && <Icon size={21} strokeWidth={2} className={iconColor} aria-hidden />}
      </span>
      <span className="t-label-l pr-6 text-ink">{title}</span>
      <span className="t-body-s text-body">{description}</span>
      <span
        aria-hidden
        className={cn(
          'absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-full transition-colors',
          selected ? 'bg-brand' : 'border-2 border-line-strong bg-page group-hover:border-[#cbc6e2]',
        )}
      >
        {selected && <Check size={13} strokeWidth={3} className="text-white" />}
      </span>
    </button>
  );
}

/* ---------------- Course card (catalog) ---------------- */
export function CourseCover({ course, className, children }: { course: CatalogCourse; className?: string; children?: ReactNode }) {
  return (
    <div className={cn('relative overflow-hidden', course.coverTint, className)}>
      {course.cover ? (
        <img src={course.cover} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <span className="t-display-l text-ink/80">{course.monogram}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export function CourseCard({
  course,
  saved,
  onToggleSave,
  onOpen,
  className,
}: {
  course: CatalogCourse;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-line bg-page transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-l',
        className,
      )}
    >
      <CourseCover course={course} className="h-[151px] w-full">
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={saved}
          aria-label={saved ? `Remove ${course.title} from saved` : `Save ${course.title}`}
          className={cn(
            'absolute right-[9px] bottom-3.5 z-10 grid size-10 place-items-center rounded-full transition-colors',
            saved ? 'bg-ink text-highlight' : 'bg-page text-ink hover:bg-highlight',
          )}
        >
          <Bookmark size={16} strokeWidth={2} fill={saved ? 'currentColor' : 'none'} aria-hidden />
        </button>
      </CourseCover>
      <div className="flex flex-col gap-2 p-[18px]">
        <p className="t-label-s text-muted">ECLearnix · {course.area}</p>
        <h3 className="t-heading-s text-ink">
          <button type="button" onClick={onOpen} className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {course.title}
          </button>
        </h3>
        <p className="t-body-s text-body">{course.meta}</p>
      </div>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-lg ring-brand group-has-[h3_button:focus-visible]:ring-2" />
    </article>
  );
}

/* ---------------- Path card (dashboard starter path) ---------------- */
export function PathCard({
  course,
  index,
  progress,
  status,
  onOpen,
}: {
  course: CatalogCourse;
  index: number;
  progress: number;
  status: 'in-progress' | 'up-next' | 'done';
  onOpen: () => void;
}) {
  const cover = course.pathCover ?? course.cover;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-[250px] shrink-0 snap-start flex-col items-start gap-2.5 rounded-lg border border-line bg-page p-4 text-left transition-[box-shadow,border-color] duration-200 hover:border-line-strong hover:shadow-l"
    >
      <div className={cn('relative h-[92px] w-full overflow-hidden rounded-md', course.coverTint)}>
        {cover ? (
          <img src={cover} alt="" className="absolute inset-0 size-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]" />
        ) : (
          <span className="t-heading-l absolute top-3 right-4 text-ink/70">{course.monogram}</span>
        )}
        <span className="t-label-l absolute top-11 left-3 grid size-9 place-items-center rounded-full bg-page text-ink">{index}</span>
      </div>
      <p className="t-label-l line-clamp-2 min-h-10 text-ink">{course.title}</p>
      <div className="flex w-full items-start justify-between">
        <span className="t-body-s text-body">{status === 'in-progress' ? 'In progress' : status === 'done' ? 'Completed' : 'Up next'}</span>
        <span className={cn('t-label-m', status === 'in-progress' ? 'text-brand' : status === 'done' ? 'text-success' : 'text-body')}>
          {status === 'in-progress' ? `${progress}%` : status === 'done' ? 'Done' : 'Start'}
        </span>
      </div>
      <Progress value={status === 'up-next' ? 0 : progress} label={`${course.title} progress`} />
    </button>
  );
}

/* ---------------- Event row ---------------- */
const dateTint = { lavender: 'bg-lavender', peach: 'bg-peach', butter: 'bg-butter', highlight: 'bg-highlight' } as const;

export function EventRow({
  event,
  registered,
  onAction,
  onDetails,
}: {
  event: LiveEvent;
  registered: boolean;
  onAction: () => void;
  onDetails: () => void;
}) {
  const label = event.action === 'join' ? (registered ? 'Joined' : 'Join') : event.action === 'register' ? (registered ? 'Registered' : 'Register') : 'Details';
  return (
    <div className="flex items-center gap-3 border-t border-line py-3">
      <div className={cn('flex h-[60px] w-14 shrink-0 flex-col items-center justify-center rounded-md', dateTint[event.tint])}>
        <span className="t-heading-s text-ink">{event.day}</span>
        <span className="t-overline text-body">{event.month}</span>
      </div>
      <button type="button" onClick={onDetails} className="group min-w-0 flex-1 text-left">
        <span className="t-label-l block truncate text-ink group-hover:text-brand">{event.title}</span>
        <span className="t-body-s mt-0.5 block truncate text-body">{event.subtitle}</span>
      </button>
      <Badge tint={event.tint === 'lavender' ? 'highlight' : event.tint} className="hidden sm:inline-flex">
        {event.tag}
      </Badge>
      <Button
        variant={event.action === 'join' && !registered ? 'primary' : 'secondary'}
        onClick={event.action === 'details' ? onDetails : onAction}
        leading={registered && event.action !== 'details' ? <Check size={16} strokeWidth={2.5} className="text-success" aria-hidden /> : undefined}
        aria-label={`${label}: ${event.title}`}
      >
        {label}
      </Button>
    </div>
  );
}

/* ---------------- Lesson row (outline) ---------------- */
export type LessonState = 'done' | 'current' | 'todo' | 'locked';

export function LessonStatusIcon({ state }: { state: LessonState }) {
  if (state === 'done')
    return (
      <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-success-bg">
        <Check size={12} strokeWidth={3} className="text-success" aria-hidden />
      </span>
    );
  if (state === 'current')
    return (
      <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-brand">
        <Play size={10} fill="white" strokeWidth={0} className="ml-px text-white" aria-hidden />
      </span>
    );
  if (state === 'locked')
    return (
      <span className="grid size-[22px] shrink-0 place-items-center rounded-full border-2 border-line-strong bg-page">
        <Lock size={11} strokeWidth={2.25} className="text-muted" aria-hidden />
      </span>
    );
  return <span className="size-[22px] shrink-0 rounded-full border-2 border-line-strong bg-page" />;
}

export function LessonRow({
  title,
  meta,
  state,
  onClick,
  compact,
}: {
  title: string;
  meta: string;
  state: LessonState;
  onClick?: () => void;
  compact?: boolean;
}) {
  const stateLabel = state === 'done' ? 'Completed' : state === 'current' ? 'Now playing' : state === 'locked' ? 'Locked' : 'Not started';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'locked' || !onClick}
      aria-current={state === 'current' ? 'step' : undefined}
      className={cn(
        'flex w-full items-start gap-2.5 rounded-md py-2.5 text-left transition-colors',
        compact ? 'px-2.5' : 'px-1',
        state === 'current' ? 'bg-brand-tint' : onClick && state !== 'locked' ? 'hover:bg-subtle' : '',
        'disabled:cursor-default',
      )}
    >
      <LessonStatusIcon state={state} />
      <span className="min-w-0 flex-1">
        <span className={cn('block', state === 'current' ? 't-label-m text-ink' : 't-body-s', state === 'locked' ? 'text-muted' : 'text-ink')}>
          {title}
        </span>
        <span className={cn('t-label-s mt-0.5 block', 'text-muted')}>
          {meta}
          <span className="sr-only"> · {stateLabel}</span>
        </span>
      </span>
    </button>
  );
}

/* ---------------- Streak day ---------------- */
export function StreakDay({ day, state, label }: { day: string; state: 'done' | 'today' | 'upcoming'; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5" title={label}>
      <span
        className={cn(
          'grid size-[30px] place-items-center rounded-full border-2',
          state === 'done' && 'border-highlight bg-highlight',
          state === 'today' && 'border-brand bg-page',
          state === 'upcoming' && 'border-line bg-page',
        )}
      >
        {state === 'done' && <Check size={13} strokeWidth={3} className="text-ink" aria-hidden />}
        <span className="sr-only">{label}</span>
      </span>
      <span className="t-label-s text-muted" aria-hidden>
        {day}
      </span>
    </div>
  );
}

/* ---------------- Certificate step ---------------- */
export function CertStep({
  state,
  label,
  caption,
  number,
}: {
  state: 'done' | 'current' | 'upcoming';
  label: string;
  caption: string;
  number?: number;
}) {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center gap-2 text-center">
      <span
        className={cn(
          'grid size-11 place-items-center rounded-full',
          state === 'done' && 'bg-brand',
          state === 'current' && 'border-[3px] border-brand bg-page',
          state === 'upcoming' && 'bg-field',
        )}
      >
        {state === 'done' && <Check size={20} strokeWidth={2.5} className="text-white" aria-hidden />}
        {state === 'current' && <span className="t-label-l text-brand">{number}</span>}
        {state === 'upcoming' && <Award size={20} strokeWidth={2} className="text-muted" aria-hidden />}
      </span>
      <span className="t-label-l text-ink">{label}</span>
      <span className="t-label-s text-muted">{caption}</span>
    </div>
  );
}
