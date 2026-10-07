import { Award, Bookmark, CalendarDays, Check, Compass, Download, Play, Search, SquarePlay } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { CourseCard, EventRow, PathCard } from '../components/cards';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Chip, EmptyState, LinkedInMark, Logo } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import { categoryChips, courseById, courses, starterPath, type CatalogCourse } from '../data/courses';
import { events } from '../data/events';
import { COURSE_ID } from '../data/lessons';
import type { CategoryId, LiveEvent } from '../data/types';
import type { ShellContext } from '../layouts/AppShell';
import { cn } from '../lib/cn';
import { useApp } from '../store/AppStore';

function PageHeader({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="t-heading-l text-ink max-sm:text-[32px] max-sm:leading-[36px]">{title}</h1>
        <p className="t-body-m text-body">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function useSaveToggle() {
  const app = useApp();
  const toast = useToast();
  return (c: CatalogCourse) => {
    const now = app.toggleSaved(c.id);
    toast.show(now ? `Saved “${c.title}”` : 'Removed from saved', { action: { label: 'Undo', onClick: () => app.toggleSaved(c.id) } });
  };
}

/* ---------------- My learning ---------------- */
export function MyLearningPage() {
  const app = useApp();
  const navigate = useNavigate();
  const { openCourse } = useOutletContext<ShellContext>();
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'not-started'>('all');
  const path = starterPath(app.interests);
  const enrolled = [...new Map([...path, ...app.saved.map((id) => courseById(id)!).filter(Boolean)].map((c) => [c.id, c])).values()];
  const list = enrolled.filter((c) => (filter === 'all' ? true : filter === 'in-progress' ? c.id === COURSE_ID : c.id !== COURSE_ID));

  return (
    <div className="mx-auto max-w-[1104px]">
      <PageHeader title="My learning" subtitle="Courses from your starter path and the ones you’ve saved." />
      <div className="mb-5 flex flex-wrap gap-2" role="toolbar" aria-label="Filter">
        {(
          [
            ['all', 'All'],
            ['in-progress', 'In progress'],
            ['not-started', 'Not started'],
          ] as const
        ).map(([id, label]) => (
          <Chip key={id} selected={filter === id} onClick={() => setFilter(id)}>
            {label}
          </Chip>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon={<Compass size={24} aria-hidden />}
          title="Nothing here yet"
          body="Pick interests or save courses from Explore and they’ll show up here."
          action={<Button to="/app/explore">Explore courses</Button>}
        />
      ) : (
        <div className="flex flex-wrap gap-3.5">
          {list.map((c, i) => (
            <PathCard
              key={c.id}
              course={c}
              index={i + 1}
              progress={c.id === COURSE_ID ? app.courseProgress : 0}
              status={c.id === COURSE_ID ? (app.courseProgress >= 100 ? 'done' : 'in-progress') : 'up-next'}
              onOpen={() => (c.id === COURSE_ID ? navigate(`/learn/${app.currentLessonId}`) : openCourse(c))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Explore ---------------- */
export function ExplorePage() {
  const app = useApp();
  const { openCourse } = useOutletContext<ShellContext>();
  const toggle = useSaveToggle();
  const [cat, setCat] = useState<CategoryId>('all');
  const [q, setQ] = useState('');
  const list = useMemo(
    () => courses.filter((c) => c.categories.includes(cat) && `${c.title} ${c.area}`.toLowerCase().includes(q.trim().toLowerCase())),
    [cat, q],
  );
  return (
    <div className="mx-auto max-w-[1104px]">
      <PageHeader title="Explore courses" subtitle="Self-paced, research-based courses — every one ends with a certificate.">
        <label className="flex h-[46px] w-full max-w-[320px] items-center gap-2.5 rounded-sm border-[1.5px] border-line-strong bg-page px-4 focus-within:border-brand">
          <Search size={18} aria-hidden />
          <span className="sr-only">Filter courses</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name" className="t-body-m min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted" />
        </label>
      </PageHeader>
      <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto" role="toolbar" aria-label="Topics">
        {categoryChips.map((c) => (
          <Chip key={c.id} selected={cat === c.id} onClick={() => setCat(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>
      <p className="t-label-m mb-3 text-body" aria-live="polite">
        {list.length} course{list.length === 1 ? '' : 's'}
      </p>
      {list.length === 0 ? (
        <EmptyState
          icon={<Search size={24} aria-hidden />}
          title="No courses match"
          body="Try a different topic or clear your filter."
          action={
            <Button variant="secondary" onClick={() => (setQ(''), setCat('all'))}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((c) => (
            <CourseCard key={c.id} course={c} saved={app.saved.includes(c.id)} onToggleSave={() => toggle(c)} onOpen={() => openCourse(c)} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Saved ---------------- */
export function SavedPage() {
  const app = useApp();
  const { openCourse } = useOutletContext<ShellContext>();
  const toggle = useSaveToggle();
  const saved = app.saved.map((id) => courseById(id)).filter((c): c is CatalogCourse => Boolean(c));
  return (
    <div className="mx-auto max-w-[1104px]">
      <PageHeader title="Saved" subtitle="Courses you’ve bookmarked for later." />
      {saved.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={24} aria-hidden />}
          title="No saved courses yet"
          body="Tap the bookmark on any course card to keep it here."
          action={<Button to="/app/explore">Explore courses</Button>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {saved.map((c) => (
            <CourseCard key={c.id} course={c} saved onToggleSave={() => toggle(c)} onOpen={() => openCourse(c)} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Events & master classes ---------------- */
function EventList({ list }: { list: LiveEvent[] }) {
  const app = useApp();
  const toast = useToast();
  const { openEvent } = useOutletContext<ShellContext>();
  return (
    <div className="rounded-xl border border-line bg-page px-5 pt-2 pb-3">
      {list.map((e, i) => (
        <div key={e.id} className={cn(i === 0 && '[&>div]:border-t-0')}>
          <EventRow
            event={e}
            registered={app.registeredEvents.includes(e.id)}
            onDetails={() => openEvent(e)}
            onAction={() => {
              const on = app.toggleEvent(e.id);
              toast.show(on ? `You're in — ${e.title}` : 'Registration cancelled');
            }}
          />
        </div>
      ))}
    </div>
  );
}

export function EventsPage() {
  const app = useApp();
  const [view, setView] = useState<'all' | 'mine'>('all');
  const list = view === 'all' ? events : events.filter((e) => app.registeredEvents.includes(e.id));
  return (
    <div className="mx-auto max-w-[860px]">
      <PageHeader title="Events" subtitle="Workshops, hackathons and conferences — free for ECLearnix learners." />
      <div className="mb-5 flex gap-2" role="tablist" aria-label="Events view">
        <Chip role="tab" aria-selected={view === 'all'} selected={view === 'all'} onClick={() => setView('all')}>
          All events
        </Chip>
        <Chip role="tab" aria-selected={view === 'mine'} selected={view === 'mine'} onClick={() => setView('mine')}>
          My registrations{app.registeredEvents.length ? ` · ${app.registeredEvents.length}` : ''}
        </Chip>
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={24} aria-hidden />}
          title="You haven’t registered for anything yet"
          body="Join a live workshop or register for a hackathon and it will show up here."
          action={
            <Button variant="secondary" onClick={() => setView('all')}>
              Browse events
            </Button>
          }
        />
      ) : (
        <EventList list={list} />
      )}
    </div>
  );
}

export function MasterClassesPage() {
  const list = events.filter((e) => e.action !== 'details');
  return (
    <div className="mx-auto max-w-[860px]">
      <PageHeader title="Master classes" subtitle="Live, expert-led sessions. Recordings are added to your library afterwards." />
      <div className="mb-6 flex items-center gap-4 rounded-xl bg-ink p-5 text-white">
        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-brand">
          <SquarePlay size={24} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="t-label-l">Next live: Writing your first abstract</p>
          <p className="t-body-s text-on-dark-muted">Tonight, 7:00 PM · 60 minutes · Free</p>
        </div>
      </div>
      <EventList list={list} />
    </div>
  );
}

/* ---------------- Certificates ---------------- */
export function CertificatesPage() {
  const app = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [viewing, setViewing] = useState<string | null>(null);
  const viewingCourse = viewing ? courseById(viewing) : undefined;
  const viewingCert = app.certificates.find((c) => c.courseId === viewing);

  return (
    <div className="mx-auto max-w-[860px]">
      <PageHeader title="Certificates" subtitle="Earned by finishing a course and submitting its project." />
      <div className="flex flex-col gap-4">
        {app.certificates.map((cert) => {
          const c = courseById(cert.courseId)!;
          return (
            <div key={cert.courseId} className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-page p-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-highlight">
                <Award size={24} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="t-overline text-muted">Certificate of completion</p>
                <p className="t-heading-s mt-1 text-ink">{c.title}</p>
                <p className="t-label-s mt-1 text-muted">Issued {cert.issued}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setViewing(cert.courseId)}>
                  View
                </Button>
                <Button
                  variant="dark"
                  disabled={cert.onLinkedIn}
                  leading={cert.onLinkedIn ? <Check size={16} strokeWidth={2.5} className="text-highlight" aria-hidden /> : <LinkedInMark />}
                  onClick={() => {
                    app.addCertificateToLinkedIn(cert.courseId);
                    toast.show('Certificate added to your LinkedIn profile');
                  }}
                >
                  {cert.onLinkedIn ? 'On LinkedIn' : 'Add to LinkedIn'}
                </Button>
              </div>
            </div>
          );
        })}

        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-line-strong bg-page p-5">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-field">
            <Award size={24} className="text-muted" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="t-overline text-muted">In progress · {app.courseProgress}%</p>
            <p className="t-heading-s mt-1 text-ink">Research Methodology Fundamentals</p>
            <p className="t-label-s mt-1 text-muted">
              {app.coreDone} of {app.coreTotal} lessons · then submit your project
            </p>
          </div>
          <Button onClick={() => navigate(`/learn/${app.currentLessonId}`)} leading={<Play size={16} fill="currentColor" strokeWidth={0} aria-hidden />}>
            Continue
          </Button>
        </div>
      </div>

      <Modal
        open={Boolean(viewingCourse)}
        onClose={() => setViewing(null)}
        title="Your certificate"
        size="lg"
        footer={
          <Button variant="secondary" leading={<Download size={16} aria-hidden />} onClick={() => toast.show('Certificate PDF downloaded')}>
            Download PDF
          </Button>
        }
      >
        {viewingCourse && (
          <div className="relative overflow-hidden rounded-lg border-[6px] border-brand-soft bg-page p-8 text-center sm:p-10">
            <span aria-hidden className="absolute -top-12 -right-12 size-40 rounded-full bg-highlight" />
            <span aria-hidden className="absolute -bottom-10 -left-10 size-32 rotate-16 rounded-[36px] bg-coral" />
            <div className="relative flex flex-col items-center gap-3">
              <Logo to={null} />
              <p className="t-overline mt-4 text-muted">Certificate of completion</p>
              <p className="t-body-m text-body">This certifies that</p>
              <p className="t-heading-l text-ink">{app.user?.name}</p>
              <p className="t-body-m text-body">has successfully completed</p>
              <p className="t-heading-m text-brand">{viewingCourse.title}</p>
              <p className="t-label-s mt-4 text-muted">Issued {viewingCert?.issued} · ECLearnix EdTech Private Limited</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
