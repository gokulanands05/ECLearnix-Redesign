import { ArrowRight, ArrowUpRight, Award, ChevronDown, Menu, Play, Sparkle, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import avatar1 from '../assets/img/avatar-1.jpg';
import avatar2 from '../assets/img/avatar-2.jpg';
import avatar3 from '../assets/img/avatar-3.jpg';
import avatar4 from '../assets/img/avatar-4.jpg';
import avatar5 from '../assets/img/avatar-5.jpg';
import googlePlay from '../assets/img/google-play.png';
import heroPreview from '../assets/img/hero-preview.jpg';
import { CertStep, CourseCard, EventRow, LessonRow } from '../components/cards';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { CourseDetailsModal, EventDetailsModal } from '../components/modals';
import { SearchBox } from '../components/SearchBox';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { handleMenuKeys, Popover } from '../components/ui/Popover';
import { Avatar, Badge, Chip, GoogleMark, LinkedInMark, Logo } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import { categoryChips, courseById, courses, popularCourseIds, type CatalogCourse } from '../data/courses';
import { events } from '../data/events';
import type { CategoryId, LiveEvent } from '../data/types';
import { cn } from '../lib/cn';
import { formatIN, useCountUp } from '../lib/useCountUp';
import { useApp } from '../store/AppStore';

const heroAvatars = [
  { src: avatar1, tint: 'bg-peach', img: 'left-[-0.97%] top-[-8.55%] h-[149.69%] w-full' },
  { src: avatar2, tint: 'bg-highlight', img: 'left-[1.02%] top-[-25.24%] h-[137.25%] w-full' },
  { src: avatar3, tint: 'bg-brand-soft', img: 'left-[1.02%] top-[-5.73%] h-[150.16%] w-full' },
  { src: avatar4, tint: 'bg-mint', img: 'left-[-23.83%] top-[9.67%] h-full w-[149.69%]' },
  { src: avatar5, tint: 'bg-butter', img: 'left-[-0.51%] top-[-10.08%] h-[149.69%] w-full' },
];

const learningPaths: {
  id: string;
  overline: string;
  overlineColor: string;
  bg: string;
  title: string;
  description: string;
  courses: string[];
  button: 'dark' | 'primary';
  category: CategoryId;
}[] = [
  {
    id: 'start',
    overline: '01 · Start',
    overlineColor: 'text-ink',
    bg: 'bg-highlight',
    title: 'Research foundations',
    description: 'Learn how real research works — questions, methods and reading papers fast.',
    courses: ['Research Methodology Fundamentals', 'Literature Review & Citations'],
    button: 'dark',
    category: 'research',
  },
  {
    id: 'grow',
    overline: '02 · Grow',
    overlineColor: 'text-brand',
    bg: 'bg-lavender',
    title: 'Paper Writing & skills',
    description: 'Write clear papers and build in-demand skills in design and development.',
    courses: ['Scientific Paper Writing', 'UI/UX Design Foundations'],
    button: 'primary',
    category: 'writing',
  },
  {
    id: 'publish',
    overline: '03 · Publish',
    overlineColor: 'text-streak',
    bg: 'bg-peach',
    title: 'Journals & conferences',
    description: 'Present at international conferences and publish with journals in our family.',
    courses: ['Journal Publication: Manuscript to Indexing', 'Global Conference Hub'],
    button: 'dark',
    category: 'journal',
  },
];

const browseGroups: { label: string; items: { label: string; category?: CategoryId; to?: string }[] }[] = [
  {
    label: 'Courses',
    items: [
      { label: 'Research methodology', category: 'research' },
      { label: 'Academic writing', category: 'writing' },
      { label: 'Journal publishing', category: 'journal' },
      { label: 'UI/UX design', category: 'uiux' },
      { label: 'Web development', category: 'webdev' },
    ],
  },
  {
    label: 'Learn live',
    items: [
      { label: 'Master classes', to: '#events' },
      { label: 'Hackathons', category: 'hackathons' },
      { label: 'Conferences', category: 'conferences' },
    ],
  },
];

export default function Landing() {
  const app = useApp();
  const navigate = useNavigate();
  const toast = useToast();

  const [category, setCategory] = useState<CategoryId>('all');
  const [showAll, setShowAll] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [googleOpen, setGoogleOpen] = useState(false);
  const [openCourse, setOpenCourse] = useState<CatalogCourse | null>(null);
  const [openEvent, setOpenEvent] = useState<LiveEvent | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const browseRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 44);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const visibleCourses = useMemo(() => {
    const list =
      category === 'all'
        ? showAll
          ? [...popularCourseIds.map((id) => courseById(id)!), ...courses.filter((c) => !popularCourseIds.includes(c.id))]
          : popularCourseIds.map((id) => courseById(id)!)
        : courses.filter((c) => c.categories.includes(category));
    return list;
  }, [category, showAll]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const pickCategory = (c: CategoryId, scroll = true) => {
    setCategory(c);
    setShowAll(false);
    if (scroll) requestAnimationFrame(() => scrollTo('courses'));
  };

  const toggleSave = (course: CatalogCourse) => {
    const now = app.toggleSaved(course.id);
    toast.show(now ? `Saved “${course.title}”` : 'Removed from saved', {
      action: now ? { label: 'Undo', onClick: () => app.toggleSaved(course.id) } : undefined,
    });
  };

  const startCourse = () => {
    setOpenCourse(null);
    navigate(app.user ? '/app' : '/signup');
  };

  const signedIn = Boolean(app.user);

  return (
    <div className="min-h-screen bg-page">
      <a href="#main" className="t-label-m sr-only z-[90] rounded-sm bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>

      {/* Announcement */}
      <div className="flex min-h-11 flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-ink px-4 py-2.5">
        <Badge>FREE</Badge>
        <p className="t-label-m text-white">Live workshops with industry experts</p>
        <button type="button" onClick={() => setScheduleOpen(true)} className="t-label-m text-highlight hover:underline hover:underline-offset-4">
          See schedule
        </button>
      </div>

      {/* Sticky nav: top row + topic chips */}
      <header className={cn('sticky top-0 z-40 bg-page transition-shadow duration-200', scrolled && 'shadow-[0_1px_0_var(--color-line),0_8px_24px_-16px_rgba(23,19,46,0.25)]')}>
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center gap-4 px-5 py-3 lg:px-20">
          <Logo />
          <Button
            variant="secondary"
            className="hidden md:inline-flex"
            aria-haspopup="menu"
            aria-expanded={browseOpen}
            onClick={() => setBrowseOpen((o) => !o)}
            trailing={<ChevronDown size={18} strokeWidth={2} className={cn('transition-transform', browseOpen && 'rotate-180')} aria-hidden />}
            ref={browseRef}
          >
            Browse
          </Button>
          <SearchBox
            variant="outline"
            className="hidden w-[440px] shrink lg:flex"
            onSelectCourse={(c) => setOpenCourse(c)}
            onSelectEvent={(e) => setOpenEvent(e)}
          />
          <div className="flex-1" />
          <nav aria-label="Primary" className="hidden items-center gap-4 lg:flex">
            <button type="button" onClick={() => scrollTo('paths')} className="t-label-m text-ink hover:text-brand">
              Master classes
            </button>
            <button type="button" onClick={() => setScheduleOpen(true)} className="t-label-m text-ink hover:text-brand">
              Events
            </button>
            {signedIn ? (
              <Button to="/app">Go to dashboard</Button>
            ) : (
              <>
                <Link to="/login" className="t-label-m text-ink hover:text-brand">
                  Log in
                </Link>
                <Button to="/signup">Sign up</Button>
              </>
            )}
          </nav>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md hover:bg-field lg:hidden"
            aria-label={mobileNav ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNav}
            onClick={() => setMobileNav((o) => !o)}
          >
            {mobileNav ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>

        {mobileNav && (
          <div className="flex animate-pop flex-col gap-3 border-t border-line px-5 py-4 lg:hidden">
            <SearchBox variant="outline" onSelectCourse={(c) => setOpenCourse(c)} onSelectEvent={(e) => setOpenEvent(e)} />
            <div className="flex gap-2">
              {signedIn ? (
                <Button to="/app" block>
                  Go to dashboard
                </Button>
              ) : (
                <>
                  <Button to="/login" variant="secondary" className="flex-1">
                    Log in
                  </Button>
                  <Button to="/signup" className="flex-1">
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-[1440px]">
          <div className="scrollbar-none flex h-[50px] gap-2 overflow-x-auto px-5 pb-3 lg:px-20" role="toolbar" aria-label="Filter courses by topic">
            {categoryChips.map((c) => (
              <Chip key={c.id} selected={category === c.id} onClick={() => pickCategory(c.id)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </div>
      </header>

      <Popover open={browseOpen} onClose={() => setBrowseOpen(false)} anchorRef={browseRef} role="menu" label="Browse" className="w-[260px] p-2">
        <div onKeyDown={handleMenuKeys}>
          {browseGroups.map((g, gi) => (
            <div key={g.label} className={cn(gi > 0 && 'mt-1 border-t border-line pt-1')}>
              <p className="t-overline px-3 pt-2 pb-1 text-muted">{g.label}</p>
              {g.items.map((it) => (
                <button
                  key={it.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setBrowseOpen(false);
                    if (it.category) pickCategory(it.category);
                    else setScheduleOpen(true);
                  }}
                  className="t-body-m flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-ink hover:bg-brand-tint focus:bg-brand-tint focus:outline-none"
                >
                  {it.label}
                  {it.category && category === it.category && <span className="size-2 rounded-full bg-brand" aria-label="current filter" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      </Popover>

      <main id="main">
        {/* Hero */}
        <section className="mx-auto flex max-w-[1440px] flex-col items-center gap-12 px-5 pt-10 pb-16 lg:flex-row lg:px-[104px] lg:pt-16 lg:pb-[72px]">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-6">
            <p className="t-label-m inline-flex items-center gap-2 rounded-full bg-brand-tint py-[7px] pr-3.5 pl-2.5 text-brand">
              <Sparkle size={16} strokeWidth={2} aria-hidden />
              India&apos;s first research-based self-learning courses
            </p>
            <h1 className="t-display-xl text-ink max-sm:text-[48px] max-sm:leading-[50px] max-sm:tracking-[-2px]">
              Research skills for the career <span className="text-brand">you want.</span>
            </h1>
            <p className="t-body-l max-w-[540px] text-body">
              Self-paced certificate courses, live master classes and conferences — made for India&apos;s college students and faculty.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Button to={signedIn ? '/app' : '/signup'} size="lg" trailing={<ArrowRight size={18} strokeWidth={2.25} aria-hidden />}>
                {signedIn ? 'Continue learning' : 'Create your account'}
              </Button>
              {!signedIn && (
                <Button size="lg" variant="secondary" leading={<GoogleMark />} onClick={() => setGoogleOpen(true)}>
                  Continue with Google
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex" aria-hidden>
                {heroAvatars.map((a, i) => (
                  <Avatar key={i} src={a.src} tint={a.tint} imgClassName={a.img} className={cn(i < heroAvatars.length - 1 && '-mr-3.5')} />
                ))}
              </div>
              <p className="t-label-m text-body">5,00,000+ students from 4,000+ colleges</p>
            </div>
          </div>

          <HeroVisual onPlay={() => setOpenCourse(courseById('research-methodology')!)} />
        </section>

        {/* Stats */}
        <section aria-label="ECLearnix in numbers" className="mx-auto max-w-[1440px] px-5 lg:px-[104px]">
          <div className="grid grid-cols-2 gap-6 rounded-xl bg-ink px-8 py-9 md:grid-cols-4 lg:px-14">
            <Stat value={500000} suffix="+" label="Students learning" highlight />
            <Stat value={4000} suffix="+" label="Colleges" />
            <Stat value={50000} suffix="+" label="Faculty Members" />
            <Stat value={100} suffix="+" label="Research-Oriented Courses" />
          </div>
        </section>

        {/* Learning paths */}
        <section id="paths" className="mx-auto flex max-w-[1440px] scroll-mt-32 flex-col gap-10 px-5 py-24 lg:px-[104px]">
          <h2 className="t-display-l text-ink max-sm:text-[40px] max-sm:leading-[44px]">Know your stuff, at every stage.</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {learningPaths.map((p) => (
              <article key={p.id} className={cn('flex flex-col items-start gap-4 rounded-xl p-[30px]', p.bg)}>
                <p className={cn('t-overline', p.overlineColor)}>{p.overline}</p>
                <h3 className="t-heading-l text-ink">{p.title}</h3>
                <p className="t-body-m text-body">{p.description}</p>
                <ul className="t-label-l flex w-full flex-col gap-2 text-ink">
                  {p.courses.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <div className="mt-auto pt-0">
                  <Button
                    variant={p.button}
                    pill
                    trailing={<ArrowRight size={18} strokeWidth={2.25} aria-hidden />}
                    onClick={() => pickCategory(p.category)}
                    aria-label={`Explore ${p.title}`}
                  >
                    Explore
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Popular courses */}
        <section id="courses" className="mx-auto flex max-w-[1440px] scroll-mt-32 flex-col gap-6 px-5 pb-24 lg:px-[104px]" aria-labelledby="courses-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="courses-title" className="t-heading-l text-ink">
              {category === 'all' ? (showAll ? 'All courses' : 'Popular courses') : categoryChips.find((c) => c.id === category)?.label}
            </h2>
            {category === 'all' ? (
              <button type="button" onClick={() => setShowAll((s) => !s)} className="t-label-l text-brand hover:underline hover:underline-offset-4" aria-expanded={showAll}>
                {showAll ? 'Show popular only' : 'View all 100+ →'}
              </button>
            ) : (
              <button type="button" onClick={() => pickCategory('all', false)} className="t-label-l text-brand hover:underline hover:underline-offset-4">
                Clear filter
              </button>
            )}
          </div>
          <p className="sr-only" aria-live="polite">
            {visibleCourses.length} courses shown
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleCourses.map((c) => (
              <CourseCard key={c.id} course={c} saved={app.saved.includes(c.id)} onToggleSave={() => toggleSave(c)} onOpen={() => setOpenCourse(c)} />
            ))}
          </div>
        </section>

        {/* Certificate */}
        <section className="mx-auto max-w-[1440px] px-5 pb-24 lg:px-[104px]">
          <div className="flex flex-col items-center gap-10 rounded-xl bg-subtle p-8 lg:flex-row lg:gap-16 lg:p-14">
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <h2 className="t-heading-l text-ink">Every course ends with a certificate.</h2>
              <p className="t-body-l text-body">
                Finish the lessons, submit a small project, and earn a certificate you can add to LinkedIn and your resume.
              </p>
              <p className="t-body-l text-body">
                <strong className="font-bold text-ink">91% of our students</strong> now complete research with confidence.
              </p>
            </div>
            <div className="flex w-full max-w-[600px] flex-col gap-[26px] rounded-lg bg-page p-5 sm:p-7">
              <div className="relative flex gap-3">
                <span aria-hidden className="absolute top-[21px] right-[16.5%] left-[16.5%] h-[3px] bg-line" />
                <span aria-hidden className="absolute top-[21px] left-[16.5%] h-[3px] w-[33.5%] bg-brand" />
                <CertStep state="done" label="Complete course" caption="All lessons done" />
                <CertStep state="current" number={2} label="Submit project" caption="Apply what you learnt" />
                <CertStep state="upcoming" label="Earn certificate" caption="Share it anywhere" />
              </div>
              <div className="flex flex-wrap items-center gap-4 rounded-md border-[1.5px] border-dashed border-line-strong p-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-highlight">
                  <Award size={24} strokeWidth={2} className="text-ink" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="t-overline text-muted">Certificate of completion</p>
                  <p className="t-heading-s mt-1 text-ink">Research Methodology Fundamentals</p>
                </div>
                <Button
                  variant="dark"
                  leading={<LinkedInMark />}
                  onClick={() =>
                    toast.show('Finish a course to earn a certificate', {
                      tone: 'info',
                      action: { label: signedIn ? 'Open dashboard' : 'Sign up', onClick: () => navigate(signedIn ? '/app' : '/signup') },
                    })
                  }
                >
                  Add to LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* All College Event app */}
        <section className="mx-auto max-w-[1440px] px-5 pb-24 lg:px-[104px]">
          <div className="relative flex flex-col items-start gap-8 overflow-hidden rounded-xl bg-brand-soft p-8 lg:flex-row lg:items-center lg:gap-14 lg:p-14">
            <span aria-hidden className="absolute top-[120px] left-[min(1040px,80%)] size-[280px] rounded-full bg-highlight" />
            <div className="relative flex min-w-0 flex-1 flex-col items-start gap-4">
              <p className="t-overline rounded-full bg-tag-purple px-3 py-1.5 text-white">All College Event app</p>
              <h2 className="t-heading-l text-ink">Find symposiums, hackathons and workshops near you.</h2>
              <p className="t-body-l text-ink">One app to discover and register for college events across India.</p>
            </div>
            <div className="relative flex flex-wrap gap-2.5">
              <Button
                href="https://play.google.com/store/search?q=all%20college%20event&c=apps"
                target="_blank"
                rel="noreferrer"
                size="lg"
                variant="secondary"
                leading={<img src={googlePlay} alt="" className="size-6 object-contain" />}
              >
                Get it on Google Play
              </Button>
              <Button
                href="https://allcollegeevent.com"
                target="_blank"
                rel="noreferrer"
                size="lg"
                variant="highlight"
                trailing={<ArrowUpRight size={18} strokeWidth={2.25} aria-hidden />}
              >
                Visit website
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-5 pb-24 text-center lg:px-[320px]">
          <h2 className="t-display-l text-ink max-sm:text-[40px] max-sm:leading-[44px]">Start learning in under a minute.</h2>
          <p className="t-body-l text-body">Create your account, pick your interests and get a starter path made for you.</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Button to={signedIn ? '/app' : '/signup'} size="lg">
              {signedIn ? 'Go to dashboard' : 'Create your account'}
            </Button>
            {!signedIn && (
              <Button size="lg" variant="secondary" leading={<GoogleMark />} onClick={() => setGoogleOpen(true)}>
                Continue with Google
              </Button>
            )}
          </div>
        </section>
      </main>

      <Footer onEvents={() => setScheduleOpen(true)} onCategory={(c) => pickCategory(c)} />

      {/* Overlays */}
      <Modal
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        eyebrow="Live this month"
        title="Workshops & events"
        description="Free live sessions with industry experts, plus hackathons and conferences from our partners."
        size="lg"
      >
        <div id="events">
          {events.map((e) => (
            <EventRow
              key={e.id}
              event={e}
              registered={app.registeredEvents.includes(e.id)}
              onDetails={() => setOpenEvent(e)}
              onAction={() => {
                if (!signedIn) {
                  setScheduleOpen(false);
                  toast.show('Create a free account to save your seat', { tone: 'info' });
                  navigate('/signup');
                  return;
                }
                const on = app.toggleEvent(e.id);
                toast.show(on ? `You're in — ${e.title}` : 'Registration cancelled');
              }}
            />
          ))}
        </div>
      </Modal>

      <CourseDetailsModal
        course={openCourse}
        onClose={() => setOpenCourse(null)}
        saved={openCourse ? app.saved.includes(openCourse.id) : false}
        onToggleSave={() => openCourse && toggleSave(openCourse)}
        primary={{ label: signedIn ? 'Go to dashboard' : 'Create account to start', onClick: startCourse }}
      />
      <EventDetailsModal
        event={openEvent}
        onClose={() => setOpenEvent(null)}
        registered={openEvent ? app.registeredEvents.includes(openEvent.id) : false}
        onToggle={() => {
          if (!openEvent) return;
          if (!signedIn) {
            setOpenEvent(null);
            navigate('/signup');
            return;
          }
          const on = app.toggleEvent(openEvent.id);
          toast.show(on ? `You're in — ${openEvent.title}` : 'Registration cancelled');
        }}
      />
      <GoogleAuthModal open={googleOpen} onClose={() => setGoogleOpen(false)} />
    </div>
  );
}

function HeroVisual({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="relative hidden h-[520px] w-[560px] shrink-0 md:block" aria-label="Course preview">
      <div className="absolute top-0 left-0 h-[400px] w-[500px] overflow-hidden rounded-xl bg-brand-soft">
        <img src={heroPreview} alt="Two learners planning a research project on a whiteboard" className="absolute inset-0 size-full object-cover" />
        <span aria-hidden className="absolute top-[316.5px] left-[18px] size-[140px] rotate-16 rounded-[40px] bg-coral" />
        <button
          type="button"
          onClick={onPlay}
          aria-label="Preview Research Methodology Fundamentals"
          className="absolute top-[298px] left-9 grid size-[66px] place-items-center rounded-full bg-page shadow-l transition-transform duration-200 hover:scale-105"
        >
          <Play size={26} fill="currentColor" strokeWidth={0} className="ml-1 text-brand" aria-hidden />
        </button>
      </div>
      <div className="absolute top-[230px] left-[212px] flex w-[348px] flex-col gap-1 rounded-lg border border-line bg-page p-[18px] shadow-l">
        <div className="flex items-start justify-between px-1.5 pb-2">
          <p className="t-heading-s text-ink">Research Methodology</p>
          <p className="t-label-m text-brand">62%</p>
        </div>
        <LessonRow compact title="What makes research original" meta="Reading · 12 min" state="done" />
        <LessonRow compact title="Reviewing literature quickly" meta="Video · 18 min" state="done" />
        <LessonRow compact title="Framing a strong research question" meta="Video · 9 min" state="current" />
        <LessonRow compact title="Choosing the right method" meta="Video · 14 min" state="locked" />
      </div>
      <div className="absolute top-[441px] left-4 -rotate-4 rounded-md bg-highlight px-3.5 py-2.5 shadow-l">
        <p className="t-label-m flex items-center gap-2 text-ink">
          <Award size={16} strokeWidth={2} aria-hidden /> Certificate on completion
        </p>
      </div>
    </div>
  );
}

function Stat({ value, suffix, label, highlight }: { value: number; suffix: string; label: string; highlight?: boolean }) {
  const { ref, value: v } = useCountUp<HTMLDivElement>(value);
  return (
    <div ref={ref} className="flex min-w-0 flex-col gap-2">
      <p className={cn('t-stat whitespace-nowrap tabular-nums max-sm:text-[36px] max-sm:leading-[40px]', highlight ? 'text-highlight' : 'text-white')}>
        {formatIN(v)}
        {suffix}
      </p>
      <p className="t-body-m text-on-dark-muted">{label}</p>
    </div>
  );
}

function Footer({ onEvents, onCategory }: { onEvents: () => void; onCategory: (c: CategoryId) => void }) {
  const cols: { title: string; links: { label: string; onClick?: () => void; href?: string }[] }[] = [
    {
      title: 'Learn',
      links: [
        { label: 'All courses', onClick: () => onCategory('all') },
        { label: 'Master classes', onClick: onEvents },
        { label: 'Campus Ambassador', href: '/signup' },
      ],
    },
    {
      title: 'Research',
      links: [
        { label: 'Conferences', onClick: () => onCategory('conferences') },
        { label: 'Journal', onClick: () => onCategory('journal') },
        { label: 'Consultancy', href: 'mailto:info@eclearnix.com?subject=Research%20consultancy' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About us', href: '#main' },
        { label: 'Careers', href: 'mailto:info@eclearnix.com?subject=Careers' },
        { label: 'Contact', href: 'mailto:info@eclearnix.com' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms', href: '#' },
        { label: 'Privacy', href: '#' },
        { label: 'Refunds', href: '#' },
      ],
    },
  ];
  return (
    <footer className="bg-ink">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 pt-14 pb-7 lg:px-[104px]">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex w-full max-w-[360px] flex-col items-start gap-3.5">
            <Logo tone="inverse" className="-ml-2" />
            <p className="t-body-m text-on-dark-muted">Education for today, careers for tomorrow, learning for life.</p>
            <a href="mailto:info@eclearnix.com" className="t-label-m text-white hover:text-highlight">
              info@eclearnix.com
            </a>
            <p className="t-body-s text-on-dark-muted">KCT Tech Park, Chinnavedampatti, Coimbatore, Tamil Nadu 641 049</p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4 lg:gap-12">
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title} className="flex flex-col items-start gap-2.5">
                <p className="t-overline text-highlight">{c.title}</p>
                {c.links.map((l) =>
                  l.onClick ? (
                    <button key={l.label} type="button" onClick={l.onClick} className="t-body-m text-on-dark-muted hover:text-white">
                      {l.label}
                    </button>
                  ) : l.href?.startsWith('/') ? (
                    <Link key={l.label} to={l.href} className="t-body-m text-on-dark-muted hover:text-white">
                      {l.label}
                    </Link>
                  ) : (
                    <a key={l.label} href={l.href} className="t-body-m text-on-dark-muted hover:text-white">
                      {l.label}
                    </a>
                  ),
                )}
              </nav>
            ))}
          </div>
        </div>
        <div className="border-t border-ink-raised pt-5">
          <p className="t-body-s text-on-dark-muted">© 2026 ECLearnix EdTech Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
