import { Award, Check, Compass, Flame, Play } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import aceLogo from '../assets/img/ace-logo.png';
import whiteboard from '../assets/img/whiteboard-wide.jpg';
import { EventRow, PathCard, StreakDay } from '../components/cards';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState, LinkedInMark, Progress, ProgressRing } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import { courseById, starterPath } from '../data/courses';
import { events } from '../data/events';
import { allLessons, COURSE_ID } from '../data/lessons';
import { weeklyGoals } from '../data/onboarding';
import type { ShellContext } from '../layouts/AppShell';
import { weekDays } from '../data/navigation';
import { cn } from '../lib/cn';
import { firstName, greeting } from '../lib/format';
import { useApp } from '../store/AppStore';

export default function Dashboard() {
  const app = useApp();
  const { openCourse, openEvent } = useOutletContext<ShellContext>();
  const navigate = useNavigate();
  const toast = useToast();
  const [goalOpen, setGoalOpen] = useState(false);

  const course = courseById(COURSE_ID)!;
  const lessonIdx = allLessons.findIndex((l) => l.id === app.currentLessonId);
  const lesson = allLessons[lessonIdx] ?? allLessons[0];
  const lessonNumberInModule = lessonIdx >= 0 ? allLessons.filter((l) => l.moduleId === lesson.moduleId).findIndex((l) => l.id === lesson.id) + 1 : 1;
  const remaining = app.weeklyGoal - app.lessonsThisWeek;
  const path = starterPath(app.interests);
  const courseDone = app.courseProgress >= 100;

  return (
    <div className="mx-auto flex max-w-[1104px] flex-col gap-6 xl:flex-row">
      {/* Left column */}
      <div className="flex min-w-0 flex-1 flex-col gap-6 xl:max-w-[760px]">
        <div className="flex flex-col gap-2">
          <h1 className="t-heading-l text-ink max-sm:text-[32px] max-sm:leading-[36px]">
            {greeting()}, {firstName(app.user?.name)}
          </h1>
          <p className="t-body-m text-body">
            {remaining > 0
              ? `You're ${remaining} lesson${remaining === 1 ? '' : 's'} away from this week's goal. Keep it going!`
              : `You hit this week's goal of ${app.weeklyGoal} lessons. Brilliant work!`}
          </p>
        </div>

        {/* Continue learning */}
        <section aria-labelledby="continue-title" className="flex flex-col gap-4 rounded-xl border border-line bg-page p-4">
          <div className="flex flex-col gap-5 md:flex-row">
            <Link
              to={`/learn/${lesson.id}`}
              className="group relative h-[200px] w-full shrink-0 overflow-hidden rounded-lg bg-brand-soft md:w-[280px]"
              aria-label={`Resume ${lesson.title}`}
            >
              <img src={whiteboard} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              <span className="absolute top-[130px] left-5 grid size-[50px] place-items-center rounded-full bg-page shadow-l transition-transform group-hover:scale-105">
                <Play size={20} fill="currentColor" strokeWidth={0} className="ml-0.5 text-ink" aria-hidden />
              </span>
            </Link>
            <div className="flex min-w-0 flex-1 flex-col items-start gap-3 px-1 py-1.5">
              <p className="t-overline text-muted">Continue learning</p>
              <h2 id="continue-title" className="t-heading-m text-ink">
                {course.title}
              </h2>
              <p className="t-body-m text-body">
                {courseDone ? 'Course complete — submit your project to earn the certificate.' : `Up next: Lesson ${lessonNumberInModule} · ${lesson.title} · ${lesson.minutes} min`}
              </p>
              <div className="flex w-full items-center gap-3">
                <Progress value={app.courseProgress} label="Course progress" />
                <span className="t-label-m shrink-0 text-ink">{app.courseProgress}%</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button to={`/learn/${lesson.id}`} leading={<Play size={16} fill="currentColor" strokeWidth={0} aria-hidden />}>
                  {app.courseProgress === 0 ? 'Start lesson' : 'Resume lesson'}
                </Button>
                <Button variant="secondary" onClick={() => openCourse(course)}>
                  Course details
                </Button>
              </div>
            </div>
          </div>
          <ol className="flex flex-col gap-3 rounded-md bg-subtle p-3.5 sm:flex-row sm:gap-2" aria-label="Certificate steps">
            <li className="flex flex-1 items-center gap-2">
              <span className={cn('grid size-[30px] shrink-0 place-items-center rounded-full', courseDone ? 'bg-success' : 'bg-brand')}>
                {courseDone ? (
                  <Check size={14} strokeWidth={3} className="text-white" aria-hidden />
                ) : (
                  <span className="t-overline text-white">{app.courseProgress}%</span>
                )}
              </span>
              <span className="t-label-m text-ink">Complete course</span>
            </li>
            <li className="flex flex-1 items-center gap-2">
              <span className={cn('t-label-m grid size-[30px] shrink-0 place-items-center rounded-full border-2', courseDone ? 'border-brand text-brand' : 'border-line-strong text-body')}>2</span>
              <span className={cn('t-label-m', courseDone ? 'text-ink' : 'text-body')}>Submit project</span>
            </li>
            <li className="flex flex-1 items-center gap-2">
              <span className="grid size-[30px] shrink-0 place-items-center rounded-full border-2 border-line-strong">
                <Award size={14} strokeWidth={2} className="text-body" aria-hidden />
              </span>
              <span className="t-label-m text-body">Earn certificate</span>
            </li>
          </ol>
        </section>

        {/* Starter path */}
        <section aria-labelledby="path-title" className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 id="path-title" className="t-heading-s text-ink">
              Your starter path
            </h2>
            <Link to="/onboarding?step=interests&edit=1" className="t-label-m text-brand hover:underline hover:underline-offset-4">
              Edit interests
            </Link>
          </div>
          {path.length === 0 ? (
            <EmptyState
              icon={<Compass size={24} aria-hidden />}
              title="No starter path yet"
              body="Pick a few interests and we’ll line up courses for you."
              action={<Button to="/onboarding?step=interests&edit=1">Pick interests</Button>}
            />
          ) : (
            <div className="scrollbar-none -mx-4 flex snap-x gap-3.5 overflow-x-auto px-4 sm:-mx-0 sm:px-0">
              {path.map((c, i) => {
                const isMain = c.id === COURSE_ID;
                return (
                  <PathCard
                    key={c.id}
                    course={c}
                    index={i + 1}
                    progress={isMain ? app.courseProgress : 0}
                    status={isMain ? (courseDone ? 'done' : 'in-progress') : 'up-next'}
                    onOpen={() => (isMain ? navigate(`/learn/${app.currentLessonId}`) : openCourse(c))}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Live this week */}
        <section aria-labelledby="live-title" className="flex flex-col gap-1 rounded-xl border border-line bg-page px-5 pt-5 pb-3">
          <div className="flex items-start justify-between pb-2">
            <h2 id="live-title" className="t-heading-s text-ink">
              Live this week
            </h2>
            <Link to="/app/events" className="t-label-m text-brand hover:underline hover:underline-offset-4">
              See all events
            </Link>
          </div>
          {events.slice(0, 3).map((e) => (
            <EventRow
              key={e.id}
              event={e}
              registered={app.registeredEvents.includes(e.id)}
              onDetails={() => openEvent(e)}
              onAction={() => {
                const on = app.toggleEvent(e.id);
                toast.show(on ? (e.action === 'join' ? `Joined — we'll send the link before 7:00 PM` : `Registered for ${e.title}`) : 'Registration cancelled', {
                  action: on ? { label: 'Undo', onClick: () => app.toggleEvent(e.id) } : undefined,
                });
              }}
            />
          ))}
        </section>
      </div>

      {/* Right rail */}
      <aside className="grid w-full shrink-0 gap-4 sm:grid-cols-2 xl:flex xl:w-[320px] xl:flex-col" aria-label="Your progress">
        <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-page p-5" aria-labelledby="streak-title">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <h2 id="streak-title" className="t-heading-s text-ink">
                {app.streak}-day streak
              </h2>
              <p className="t-body-s text-body">Best: {app.bestStreak} days</p>
            </div>
            <span className="grid size-12 place-items-center rounded-md bg-streak-bg">
              <Flame size={24} strokeWidth={2} className="text-streak" aria-hidden />
            </span>
          </div>
          <div className="flex justify-between">
            {weekDays.map((w, i) => (
              <StreakDay key={i} day={w.d} label={`${w.label}: ${i < 5 ? 'done' : i === 5 ? 'today' : 'upcoming'}`} state={i < 5 ? 'done' : i === 5 ? 'today' : 'upcoming'} />
            ))}
          </div>
        </section>

        <section className="flex h-[100px] items-center gap-[18px] overflow-hidden rounded-lg border border-line bg-page px-5" aria-labelledby="goal-title">
          <ProgressRing value={app.lessonsThisWeek} max={app.weeklyGoal}>
            <span className="t-heading-m text-ink" aria-hidden>
              {Math.min(app.lessonsThisWeek, 99)}/{app.weeklyGoal}
            </span>
          </ProgressRing>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
            <h2 id="goal-title" className="t-label-l text-ink">
              Weekly goal
            </h2>
            <p className="t-body-s text-body">
              {app.lessonsThisWeek} of {app.weeklyGoal} lessons done this week
            </p>
            <button type="button" onClick={() => setGoalOpen(true)} className="t-label-m text-brand hover:underline hover:underline-offset-4">
              Edit goal
            </button>
          </div>
        </section>

        <CertificatesCard />

        <section className="flex h-[100px] items-center gap-3.5 rounded-lg border border-line bg-page p-[18px]">
          <span className="grid size-12 shrink-0 place-items-center rounded-md bg-[#f6f6f6]">
            <img src={aceLogo} alt="" className="h-[9px] w-[22px] object-contain" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="t-label-m text-ink">Find events near you</p>
            <p className="t-label-s text-body">All College Event app</p>
          </div>
          <Button
            variant="secondary"
            href="https://play.google.com/store/search?q=all%20college%20event&c=apps"
            target="_blank"
            rel="noreferrer"
            aria-label="Get the All College Event app (opens in a new tab)"
          >
            Get app
          </Button>
        </section>
      </aside>

      <GoalModal key={goalOpen ? 'open' : 'closed'} open={goalOpen} onClose={() => setGoalOpen(false)} />
    </div>
  );
}

function CertificatesCard() {
  const app = useApp();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const cert = app.certificates[0];
  const certCourse = cert ? courseById(cert.courseId) : undefined;
  return (
    <section className="relative flex flex-col gap-3.5 overflow-hidden rounded-lg bg-ink p-5" aria-labelledby="certs-title">
      <span aria-hidden className="absolute top-[-40px] left-[240px] size-[120px] rounded-full bg-brand" />
      <h2 id="certs-title" className="t-overline relative text-highlight">
        Certificates · {app.certificates.length} earned
      </h2>
      {cert && certCourse && (
        <>
          <Link to="/app/certificates" className="relative flex items-center gap-3 rounded-md bg-page p-3.5 transition-colors hover:bg-subtle">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-highlight">
              <Award size={20} strokeWidth={2} className="text-ink" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="t-label-m truncate text-ink">{certCourse.title}</span>
              <span className="t-label-s text-muted">Issued {cert.issued}</span>
            </span>
          </Link>
          <Button
            variant="highlight"
            block
            className="relative"
            loading={adding}
            disabled={cert.onLinkedIn}
            leading={cert.onLinkedIn ? <Check size={18} strokeWidth={2.5} aria-hidden /> : <LinkedInMark />}
            onClick={() => {
              setAdding(true);
              window.setTimeout(() => {
                setAdding(false);
                app.addCertificateToLinkedIn(cert.courseId);
                toast.show('Certificate added to your LinkedIn profile');
              }, 900);
            }}
          >
            {cert.onLinkedIn ? 'Added to LinkedIn' : adding ? 'Connecting…' : 'Add to LinkedIn'}
          </Button>
        </>
      )}
    </section>
  );
}

function GoalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const app = useApp();
  const toast = useToast();
  const [value, setValue] = useState(app.weeklyGoal);
  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Weekly goal"
      title="How many lessons a week?"
      description="Pick a pace you can keep up. Your streak counts any day you finish a lesson."
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              app.setWeeklyGoal(value);
              onClose();
              toast.show(`Weekly goal set to ${value} lessons`);
            }}
            disabled={value === app.weeklyGoal}
          >
            Save goal
          </Button>
        </>
      }
    >
      <div role="radiogroup" aria-label="Lessons per week" className="grid grid-cols-2 gap-3">
        {weeklyGoals.map((g) => (
          <button
            key={g.lessons}
            type="button"
            role="radio"
            aria-checked={value === g.lessons}
            onClick={() => setValue(g.lessons)}
            data-autofocus={value === g.lessons ? true : undefined}
            className={cn(
              'flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-colors',
              value === g.lessons ? 'border-brand bg-brand-tint' : 'border-line hover:border-line-strong hover:bg-subtle',
            )}
          >
            <span className="t-heading-m text-ink">{g.lessons}</span>
            <span className="t-label-m text-ink">{g.title}</span>
            <span className="t-label-s text-muted">{g.description.split('·')[1]?.trim()}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
