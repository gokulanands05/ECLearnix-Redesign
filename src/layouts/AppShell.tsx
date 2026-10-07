import { Award, Bell, Check, Flame, LogOut, Menu, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AmbassadorModal } from '../components/AmbassadorModal';
import { StreakDay } from '../components/cards';
import { CourseDetailsModal, EventDetailsModal } from '../components/modals';
import { SearchBox } from '../components/SearchBox';
import { Button } from '../components/ui/Button';
import { handleMenuKeys, Popover } from '../components/ui/Popover';
import { Avatar, Logo } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import type { CatalogCourse } from '../data/courses';
import type { LiveEvent } from '../data/types';
import { cn } from '../lib/cn';
import { initials } from '../lib/format';
import { navItems, weekDays } from '../data/navigation';
import { useApp } from '../store/AppStore';

/** Shared overlay helpers so any page in the shell can open course / event details */
export interface ShellContext {
  openCourse: (c: CatalogCourse) => void;
  openEvent: (e: LiveEvent) => void;
  openAmbassador: () => void;
}

export default function AppShell() {
  const app = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [drawer, setDrawer] = useState(false);
  const [course, setCourse] = useState<CatalogCourse | null>(null);
  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [ambassador, setAmbassador] = useState(false);

  useEffect(() => setDrawer(false), [location.pathname]);

  const ctx: ShellContext = { openCourse: setCourse, openEvent: setEvent, openAmbassador: () => setAmbassador(true) };

  return (
    <div className="min-h-screen bg-app">
      <a href="#app-main" className="t-label-m sr-only z-[90] rounded-sm bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <div className="flex">
        {/* Side nav */}
        <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 border-r border-[rgba(37,99,235,0.1)] bg-page lg:block">
          <SideNavContent onAmbassador={() => setAmbassador(true)} />
        </aside>

        {/* Mobile drawer */}
        {drawer && (
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <div className="absolute inset-0 animate-fade bg-ink/50" onClick={() => setDrawer(false)} aria-hidden />
            <div className="absolute inset-y-0 left-0 w-[280px] animate-pop bg-page shadow-l">
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="Close navigation"
                className="absolute top-4 right-3 grid size-10 place-items-center rounded-sm hover:bg-field"
              >
                <X size={20} aria-hidden />
              </button>
              <SideNavContent onAmbassador={() => setAmbassador(true)} />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-line-blue bg-page">
            <div className="flex h-[78px] items-center gap-3 px-4 sm:px-6">
              <button
                type="button"
                onClick={() => setDrawer(true)}
                aria-label="Open navigation"
                className="grid size-11 shrink-0 place-items-center rounded-md hover:bg-field lg:hidden"
              >
                <Menu size={22} aria-hidden />
              </button>
              <SearchBox variant="filled" className="w-full max-w-[520px]" onSelectCourse={setCourse} onSelectEvent={setEvent} />
              <div className="flex-1" />
              <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                <StreakButton />
                <NotificationsButton />
                <AccountMenu
                  onLogout={() => {
                    app.logOut();
                    toast.show('You’ve been logged out', { tone: 'info' });
                    navigate('/');
                  }}
                />
              </div>
            </div>
          </header>

          <main id="app-main" className="px-4 pt-5 pb-16 sm:px-6">
            <Outlet context={ctx} />
          </main>
        </div>
      </div>

      <CourseDetailsModal
        course={course}
        onClose={() => setCourse(null)}
        saved={course ? app.saved.includes(course.id) : false}
        onToggleSave={() => {
          if (!course) return;
          const now = app.toggleSaved(course.id);
          toast.show(now ? `Saved “${course.title}”` : 'Removed from saved');
        }}
        primary={
          course?.id === 'research-methodology'
            ? { label: app.courseProgress > 0 ? 'Resume lesson' : 'Start course', onClick: () => (setCourse(null), navigate(`/learn/${app.currentLessonId}`)) }
            : {
                label: 'Enrol for free',
                onClick: () => {
                  const c = course;
                  setCourse(null);
                  if (c && !app.saved.includes(c.id)) app.toggleSaved(c.id);
                  toast.show(`Enrolled in ${c?.title}. First lesson unlocks tomorrow.`);
                },
              }
        }
      />
      <EventDetailsModal
        event={event}
        onClose={() => setEvent(null)}
        registered={event ? app.registeredEvents.includes(event.id) : false}
        onToggle={() => {
          if (!event) return;
          const on = app.toggleEvent(event.id);
          toast.show(on ? `You're in — ${event.title}. We'll remind you.` : 'Registration cancelled');
        }}
      />
      <AmbassadorModal open={ambassador} onClose={() => setAmbassador(false)} />
    </div>
  );
}

function SideNavContent({ onAmbassador }: { onAmbassador: () => void }) {
  const app = useApp();
  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-4 pt-5 pb-6">
      <div className="flex flex-col gap-7">
        <Logo to="/app" />
        <nav aria-label="Main" className="flex flex-col gap-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex h-11 items-center gap-3 rounded-md px-3 transition-colors',
                  isActive ? 't-label-l bg-brand-tint text-brand' : 't-body-m text-ink hover:bg-subtle',
                )
              }
            >
              <Icon size={20} strokeWidth={2} aria-hidden />
              {label}
              {label === 'Saved' && app.saved.length > 0 && (
                <span className="t-label-s ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1.5 text-white">{app.saved.length}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="relative mt-8 flex flex-col items-start gap-3 overflow-hidden rounded-lg bg-coral p-4">
        <span aria-hidden className="absolute top-[120px] left-[160px] size-[100px] rounded-full bg-highlight" />
        <p className="t-heading-s relative text-ink">Be a Campus Ambassador</p>
        <p className="t-body-s relative text-ink">Lead events and grow your network at your college.</p>
        <Button
          variant="dark"
          className="relative"
          onClick={onAmbassador}
          leading={app.ambassadorApplied ? <Check size={16} strokeWidth={2.5} className="text-highlight" aria-hidden /> : undefined}
        >
          {app.ambassadorApplied ? 'Applied' : 'Apply now'}
        </Button>
      </div>
    </div>
  );
}

function StreakButton() {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${app.streak}-day streak`}
        className="t-label-m flex items-center gap-1.5 rounded-full bg-streak-bg px-3 py-2.5 text-streak transition-colors hover:bg-[#ffe3d4]"
      >
        <Flame size={16} strokeWidth={2} aria-hidden />
        {app.streak}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={ref} placement="bottom-end" label="Streak" className="w-[300px] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="t-heading-s text-ink">{app.streak}-day streak</p>
            <p className="t-body-s text-body">Best: {app.bestStreak} days</p>
          </div>
          <span className="grid size-12 place-items-center rounded-md bg-streak-bg">
            <Flame size={24} className="text-streak" aria-hidden />
          </span>
        </div>
        <div className="mt-4 flex justify-between">
          {weekDays.map((w, i) => (
            <StreakDay key={i} day={w.d} label={w.label} state={i < 5 ? 'done' : i === 5 ? 'today' : 'upcoming'} />
          ))}
        </div>
        <p className="t-body-s mt-4 rounded-sm bg-subtle px-3 py-2 text-body">Finish one lesson today to make it {app.streak + 1} days.</p>
      </Popover>
    </>
  );
}

function NotificationsButton() {
  const app = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const targetFor = (kind: string) => (kind === 'event' ? '/app/events' : kind === 'certificate' ? '/app/certificates' : kind === 'course' ? '/app/learning' : '/app');
  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={app.unreadCount ? `Notifications, ${app.unreadCount} unread` : 'Notifications'}
        className="relative grid size-11 place-items-center rounded-md text-ink transition-colors hover:bg-field aria-expanded:bg-field"
      >
        <Bell size={20} strokeWidth={2} aria-hidden />
        {app.unreadCount > 0 && <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full border-2 border-page bg-coral" aria-hidden />}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={ref} placement="bottom-end" label="Notifications" className="w-[min(360px,calc(100vw-16px))] py-2">
        <div className="flex items-center justify-between px-4 pt-2 pb-3">
          <p className="t-heading-s text-ink">Notifications</p>
          <button
            type="button"
            disabled={!app.unreadCount}
            onClick={app.markAllNotificationsRead}
            className="t-label-m text-brand hover:underline hover:underline-offset-4 disabled:text-muted disabled:no-underline"
          >
            Mark all read
          </button>
        </div>
        <ul className="max-h-[360px] overflow-y-auto">
          {app.notifications.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  app.markNotificationRead(n.id);
                  setOpen(false);
                  navigate(targetFor(n.kind));
                }}
                className={cn('flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle', !n.read && 'bg-brand-tint/60')}
              >
                <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand')} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="t-label-m block text-ink">{n.title}</span>
                  <span className="t-body-s block text-body">{n.body}</span>
                </span>
                <span className="t-label-s shrink-0 text-muted">{n.time}</span>
                <span className="sr-only">{n.read ? '' : '(unread)'}</span>
              </button>
            </li>
          ))}
        </ul>
      </Popover>
    </>
  );
}

function AccountMenu({ onLogout }: { onLogout: () => void }) {
  const app = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const item = 't-body-m flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-ink hover:bg-brand-tint focus:bg-brand-tint focus:outline-none';
  return (
    <>
      <button
        ref={ref}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="rounded-full transition-shadow hover:shadow-[0_0_0_3px_var(--color-brand-tint)]"
      >
        <Avatar initials={initials(app.user?.name, app.user?.email)} />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={ref} placement="bottom-end" role="menu" label="Account" className="w-[260px] p-2">
        <div onKeyDown={handleMenuKeys}>
          <div className="flex items-center gap-3 border-b border-line px-3 pt-2 pb-3">
            <Avatar initials={initials(app.user?.name, app.user?.email)} className="border-0" />
            <div className="min-w-0">
              <p className="t-label-m truncate text-ink">{app.user?.name}</p>
              <p className="t-body-s truncate text-body">{app.user?.email}</p>
            </div>
          </div>
          <div className="pt-1">
            <button type="button" role="menuitem" className={item} onClick={() => (setOpen(false), navigate('/onboarding?step=interests&edit=1'))}>
              <SlidersHorizontal size={18} aria-hidden /> Edit interests
            </button>
            <button type="button" role="menuitem" className={item} onClick={() => (setOpen(false), navigate('/app/certificates'))}>
              <Award size={18} aria-hidden /> My certificates
            </button>
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={() => {
                setOpen(false);
                app.resetDemo();
                toast.show('Demo progress reset', { tone: 'info' });
              }}
            >
              <RotateCcw size={18} aria-hidden /> Reset demo progress
            </button>
            <button type="button" role="menuitem" className={cn(item, 'text-danger')} onClick={() => (setOpen(false), onLogout())}>
              <LogOut size={18} aria-hidden /> Log out
            </button>
          </div>
        </div>
      </Popover>
    </>
  );
}
