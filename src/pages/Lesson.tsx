import { Award, BookOpenText, Check, ChevronDown, ChevronLeft, ChevronRight, Menu, PanelLeftOpen, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import videoPoster from '../assets/img/hero-preview.jpg';
import { LessonRow, type LessonState } from '../components/cards';
import { LessonTabs, type TabName } from '../components/lesson/LessonTabs';
import { VideoPlayer } from '../components/lesson/VideoPlayer';
import { Quiz } from '../components/Quiz';
import { Button, IconButton } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Avatar, Logo, Progress } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import { courseById } from '../data/courses';
import { allLessons, COURSE_ID, modules, quiz, transcripts } from '../data/lessons';
import type { Lesson as LessonT } from '../data/types';
import { cn } from '../lib/cn';
import { initials } from '../lib/format';
import { useApp } from '../store/AppStore';

const lessonMeta = (l: LessonT) => (l.kind === 'Quiz' ? `Quiz · ${l.questions} questions` : `${l.kind} · ${l.minutes} min`);

export default function LessonPage() {
  const { lessonId = '' } = useParams();
  const app = useApp();
  const navigate = useNavigate();
  const toast = useToast();

  const idx = allLessons.findIndex((l) => l.id === lessonId);
  const lesson = allLessons[idx];
  const course = courseById(COURSE_ID)!;
  const coreComplete = app.coreDone >= app.coreTotal;

  const isLocked = useCallback((moduleNumber: number) => moduleNumber > 2 && !coreComplete, [coreComplete]);

  const transcript = useMemo(() => transcripts[lessonId] ?? [], [lessonId]);
  const startAt = lessonId === 'framing-research-question' ? 252 : 0;
  const [time, setTime] = useState(startAt);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<TabName>('Transcript');
  const [menuHidden, setMenuHidden] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [ended, setEnded] = useState(false);
  const [openModules, setOpenModules] = useState<string[]>(() => (lesson ? [lesson.moduleId] : ['m2']));

  // reset per lesson
  useEffect(() => {
    if (!lesson) return;
    setTime(lessonId === 'framing-research-question' ? 252 : 0);
    setPlaying(false);
    setEnded(false);
    setTab('Transcript');
    setDrawer(false);
    setOpenModules((m) => (m.includes(lesson.moduleId) ? m : [...m, lesson.moduleId]));
    app.setCurrentLesson(lesson.id);
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const activeIndex = useMemo(() => {
    let a = 0;
    transcript.forEach((l, i) => {
      if (time >= l.at) a = i;
    });
    return a;
  }, [time, transcript]);

  if (!lesson) return <Navigate to="/app" replace />;
  if (isLocked(lesson.moduleNumber)) return <Navigate to={`/learn/${app.currentLessonId}`} replace />;

  const moduleInfo = modules.find((m) => m.id === lesson.moduleId)!;
  const posInModule = moduleInfo.lessons.findIndex((l) => l.id === lesson.id) + 1;
  const prev = allLessons[idx - 1];
  const next = allLessons[idx + 1];
  const nextLocked = next ? isLocked(next.moduleNumber) : true;
  const done = app.completed.includes(lesson.id);
  const isVideo = lesson.kind === 'Video';

  const stateFor = (l: { id: string }, moduleNumber: number): LessonState =>
    l.id === lesson.id ? 'current' : app.completed.includes(l.id) ? 'done' : isLocked(moduleNumber) ? 'locked' : 'todo';

  const toggleComplete = () => {
    app.setLessonComplete(lesson.id, !done);
    if (!done) {
      toast.show('Lesson marked complete', {
        action: next && !isLocked(next.moduleNumber) ? { label: 'Next lesson', onClick: () => navigate(`/learn/${next.id}`) } : undefined,
      });
    } else toast.show('Marked as not complete', { tone: 'info' });
  };

  const goNext = () => {
    if (!next) return;
    if (nextLocked) {
      toast.show('Finish Modules 1–2 to unlock the next module', { tone: 'info' });
      return;
    }
    navigate(`/learn/${next.id}`);
  };

  const outline = (
    <nav aria-label="Course outline" className="flex flex-col px-2 pb-6">
      {modules.map((m) => {
        const doneCount = m.lessons.filter((l) => app.completed.includes(l.id)).length;
        const open = openModules.includes(m.id);
        const current = m.id === lesson.moduleId;
        return (
          <div key={m.id}>
            <button
              type="button"
              onClick={() => setOpenModules((o) => (o.includes(m.id) ? o.filter((x) => x !== m.id) : [...o, m.id]))}
              aria-expanded={open}
              aria-controls={`module-${m.id}`}
              className="group flex w-full items-center justify-between gap-2 rounded-sm py-3 text-left"
            >
              <span className={cn('t-label-m', current ? 'text-ink' : 'text-body group-hover:text-ink')}>
                {m.number} · {m.title}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="t-label-s text-muted">
                  {doneCount}/{m.lessons.length}
                </span>
                <ChevronDown size={14} className={cn('text-muted transition-transform duration-200', open ? 'rotate-180' : '')} aria-hidden />
              </span>
            </button>
            {open && (
              <div id={`module-${m.id}`} className="flex animate-fade flex-col gap-2 pb-2">
                {m.lessons.map((l) => {
                  const st = stateFor(l, m.number);
                  return (
                    <LessonRow
                      key={l.id}
                      title={l.title}
                      meta={st === 'locked' ? 'Unlocks after Module 2' : lessonMeta(l)}
                      state={st}
                      onClick={st === 'locked' ? undefined : () => navigate(`/learn/${l.id}`)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-app">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line-blue bg-page">
        <div className="flex h-[61px] items-center gap-4 px-4 sm:px-6">
          <button type="button" onClick={() => setDrawer(true)} aria-label="Open course outline" className="grid size-10 place-items-center rounded-md hover:bg-field lg:hidden">
            <Menu size={20} aria-hidden />
          </button>
          <Logo to="/app" className="hidden sm:inline-flex" />
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex min-w-0 items-center gap-2">
              <li className="hidden min-w-0 md:block">
                <Link to="/app" className="t-label-s block truncate text-body hover:text-ink hover:underline hover:underline-offset-2">
                  {course.title}
                </Link>
              </li>
              <li aria-hidden className="hidden md:block">
                <ChevronRight size={14} className="text-body" />
              </li>
              <li className="t-body-s hidden shrink-0 text-body md:block">Module {moduleInfo.number}</li>
              <li aria-hidden className="hidden md:block">
                <ChevronRight size={14} className="text-body" />
              </li>
              <li className="t-label-m min-w-0 truncate text-ink" aria-current="page">
                {lesson.title}
              </li>
            </ol>
          </nav>
          <div className="hidden items-center gap-2.5 rounded-full bg-field px-3.5 py-[11px] sm:flex" aria-label={`Course ${app.courseProgress}% complete`}>
            <Progress value={app.courseProgress} className="h-1.5 w-16" label="Course progress" />
            <span className="t-label-m whitespace-nowrap text-ink">{app.courseProgress}% complete</span>
          </div>
          <Link to="/app" aria-label="Back to dashboard" className="rounded-full">
            <Avatar initials={initials(app.user?.name, app.user?.email)} />
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Outline */}
        {!menuHidden && (
          <aside className="sticky top-[61px] hidden h-[calc(100vh-61px)] w-[264px] shrink-0 overflow-y-auto border-r border-[rgba(37,99,235,0.1)] bg-page lg:block">
            <div className="px-2 pt-4">
              <button type="button" onClick={() => setMenuHidden(true)} className="t-label-m flex items-center gap-2 rounded-sm py-2.5 text-body hover:text-ink">
                <Menu size={16} strokeWidth={2.25} aria-hidden /> Hide menu
              </button>
            </div>
            {outline}
          </aside>
        )}

        {drawer && (
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Course outline">
            <div className="absolute inset-0 animate-fade bg-ink/50" onClick={() => setDrawer(false)} aria-hidden />
            <div className="absolute inset-y-0 left-0 w-[300px] animate-pop overflow-y-auto bg-page shadow-l">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <p className="t-heading-s text-ink">Course outline</p>
                <button type="button" onClick={() => setDrawer(false)} aria-label="Close outline" className="grid size-10 place-items-center rounded-sm hover:bg-field">
                  <X size={20} aria-hidden />
                </button>
              </div>
              <div className="px-2">{outline}</div>
            </div>
          </div>
        )}

        <div className={cn('flex min-w-0 flex-1 flex-col gap-3 px-4 pt-6 pb-16 sm:px-6 xl:flex-row xl:pr-6', menuHidden && 'mx-auto max-w-[1240px]')}>
          {menuHidden && (
            <div className="hidden lg:block xl:absolute xl:mt-[-12px] xl:ml-[-6px]">
              <button type="button" onClick={() => setMenuHidden(false)} className="t-label-m mb-3 flex items-center gap-2 rounded-sm py-1 text-body hover:text-ink xl:mb-0">
                <PanelLeftOpen size={16} aria-hidden /> Show menu
              </button>
            </div>
          )}

          {/* Player column */}
          <section className="flex min-w-0 flex-1 flex-col gap-5 xl:max-w-[840px]" aria-labelledby="lesson-title">
            {isVideo ? (
              <div className="relative">
                <VideoPlayer
                  poster={videoPoster}
                  title={lesson.title}
                  duration={lesson.duration ?? lesson.minutes * 60}
                  time={time}
                  playing={playing}
                  onTime={setTime}
                  onPlaying={setPlaying}
                  caption={transcript[activeIndex]?.text}
                  onEnded={() => setEnded(true)}
                />
                {ended && (
                  <div className="absolute inset-x-0 top-0 bottom-[84px] grid place-items-center rounded-t-xl bg-ink/70 p-6 text-center">
                    <div className="flex animate-pop flex-col items-center gap-3">
                      <p className="t-heading-m text-white">Nice — you finished the video</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {!done && (
                          <Button
                            variant="highlight"
                            leading={<Check size={18} strokeWidth={2.5} aria-hidden />}
                            onClick={() => {
                              app.setLessonComplete(lesson.id, true);
                              setEnded(false);
                              toast.show('Lesson marked complete');
                            }}
                          >
                            Mark complete
                          </Button>
                        )}
                        {next && (
                          <Button variant={done ? 'highlight' : 'secondary'} onClick={goNext} trailing={<ChevronRight size={18} aria-hidden />}>
                            Next lesson
                          </Button>
                        )}
                        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setEnded(false)}>
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : lesson.kind === 'Quiz' ? (
              <div className="rounded-xl border border-line bg-page p-5 sm:p-7">
                <p className="t-overline mb-4 text-muted">Quiz · {lesson.questions} questions · about {lesson.minutes} min</p>
                <Quiz
                  questions={quiz.slice(0, lesson.questions)}
                  onFinish={(score, passed) => {
                    if (passed) app.setLessonComplete(lesson.id, true);
                    else toast.show(`${score} correct — try again to pass`, { tone: 'info' });
                  }}
                  onContinue={goNext}
                  continueLabel="Next lesson"
                />
              </div>
            ) : (
              <ReadingCard lesson={lesson} />
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h1 id="lesson-title" className="t-heading-m text-ink">
                  {lesson.title}
                </h1>
                <p className="t-body-s text-body">
                  {lesson.kind} · {lesson.minutes} min · Module {moduleInfo.number}, Lesson {posInModule} of {moduleInfo.lessons.length}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <IconButton
                  variant="outline"
                  label={prev ? `Previous lesson: ${prev.title}` : 'No previous lesson'}
                  disabled={!prev}
                  onClick={() => prev && navigate(`/learn/${prev.id}`)}
                >
                  <ChevronLeft size={17} strokeWidth={2.25} aria-hidden />
                </IconButton>
                <Button
                  variant={done ? 'secondary' : 'primary'}
                  onClick={toggleComplete}
                  aria-pressed={done}
                  leading={<Check size={done ? 18 : 24} strokeWidth={done ? 2.5 : 2} className={done ? 'text-success' : ''} aria-hidden />}
                >
                  {done ? 'Completed' : 'Mark complete'}
                </Button>
                <Button variant="secondary" onClick={goNext} disabled={!next} trailing={<ChevronRight size={18} strokeWidth={2.25} aria-hidden />}>
                  Next lesson
                </Button>
              </div>
            </div>

            <LessonTabs
              lessonId={lesson.id}
              transcript={transcript}
              time={time}
              activeIndex={activeIndex}
              onSeek={(t) => {
                setTime(t);
                setEnded(false);
              }}
              tab={tab}
              onTab={setTab}
              hasVideo={isVideo}
            />
          </section>

          {/* Right rail */}
          <aside className="grid w-full shrink-0 gap-4 sm:grid-cols-2 xl:flex xl:w-[276px] xl:flex-col" aria-label="Course progress and next steps">
            <section className="flex flex-col gap-3.5 rounded-lg border border-line bg-page p-[18px]" aria-labelledby="cert-title">
              <h2 id="cert-title" className="t-overline text-muted">
                Your certificate
              </h2>
              <CertRow
                badge={
                  coreComplete ? (
                    <span className="grid size-8 place-items-center rounded-full bg-success">
                      <Check size={15} strokeWidth={3} className="text-white" aria-hidden />
                    </span>
                  ) : (
                    <span className="t-overline grid size-8 place-items-center rounded-full bg-brand text-white">{app.courseProgress}%</span>
                  )
                }
                title="Complete course"
                caption={`${app.coreDone} of ${app.coreTotal} lessons`}
              />
              <CertRow
                badge={<span className="t-label-m grid size-8 place-items-center rounded-full border-2 border-line-strong text-body">2</span>}
                title="Submit project"
                caption="Draft your own question"
              />
              <CertRow
                badge={
                  <span className="grid size-8 place-items-center rounded-full bg-highlight">
                    <Award size={15} strokeWidth={2} className="text-ink" aria-hidden />
                  </span>
                }
                title="Earn certificate"
                caption="Add it to LinkedIn"
              />
            </section>

            {next && (
              <section className="relative flex flex-col items-start gap-2.5 overflow-hidden rounded-lg bg-ink p-[18px]" aria-labelledby="upnext-title">
                <span aria-hidden className="absolute top-[120px] left-[210px] size-[100px] rounded-full bg-brand" />
                <p className="t-overline relative text-highlight">Up next</p>
                <h2 id="upnext-title" className="t-heading-s relative text-white">
                  {next.kind === 'Quiz' ? `Quiz: ${next.title}` : next.title}
                </h2>
                <p className="t-label-s relative text-on-dark-muted">
                  {next.kind === 'Quiz' ? `${next.questions} Questions · About ${next.minutes} min` : `${next.kind} · ${next.minutes} min`}
                </p>
                <Button
                  variant="highlight"
                  className="relative"
                  onClick={() => (next.kind === 'Quiz' && !nextLocked ? setQuizOpen(true) : goNext())}
                >
                  {nextLocked ? 'Locked' : next.kind === 'Quiz' ? 'Start quiz' : 'Start lesson'}
                </Button>
              </section>
            )}

            <section className="flex flex-col items-start gap-2 rounded-lg border border-line bg-page p-[18px]">
              <h2 className="t-label-l text-ink">Stuck on your question?</h2>
              <p className="t-body-s text-body">Join tonight&apos;s free workshop and ask an expert live.</p>
              <Link to="/app/events" className="t-label-m text-brand hover:underline hover:underline-offset-4">
                See live sessions
              </Link>
            </section>
          </aside>
        </div>
      </div>

      {next && next.kind === 'Quiz' && (
        <Modal open={quizOpen} onClose={() => setQuizOpen(false)} tone="dark" eyebrow="Quiz" title={next.title} description={`${next.questions} questions · about ${next.minutes} min`}>
          <Quiz
            questions={quiz.slice(0, next.questions)}
            onFinish={(score, passed) => {
              if (passed) app.setLessonComplete(next.id, true);
              else toast.show(`${score} correct — try again to pass`, { tone: 'info' });
            }}
            onContinue={() => {
              setQuizOpen(false);
              toast.show('Quiz complete — nice work!');
            }}
            continueLabel="Back to lesson"
          />
        </Modal>
      )}
    </div>
  );
}

function CertRow({ badge, title, caption }: { badge: React.ReactNode; title: string; caption: string }) {
  return (
    <div className="flex items-center gap-3">
      {badge}
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="t-label-m text-ink">{title}</p>
        <p className="t-label-s text-muted">{caption}</p>
      </div>
    </div>
  );
}

function ReadingCard({ lesson }: { lesson: LessonT }) {
  return (
    <article className="rounded-xl border border-line bg-page p-6 sm:p-8">
      <p className="t-overline mb-3 flex items-center gap-2 text-muted">
        <BookOpenText size={16} aria-hidden /> Reading · {lesson.minutes} min
      </p>
      <div className="flex max-w-[680px] flex-col gap-4">
        <p className="t-body-l text-ink">
          Good research starts long before data collection. This reading walks through the thinking behind <strong>{lesson.title.toLowerCase()}</strong>, with examples from
          real student projects.
        </p>
        <p className="t-body-m text-body">
          Start by writing your idea in one sentence. Then ask who it affects, where it happens and over what period. Each answer narrows the scope and makes the work
          possible within a semester.
        </p>
        <blockquote className="t-body-m rounded-md border-l-4 border-brand bg-brand-tint px-4 py-3 text-ink">
          Tip: keep a running list of questions you notice while reading papers — most good projects begin as a “why does…?” in the margin.
        </blockquote>
        <p className="t-body-m text-body">
          When you’re done, mark this lesson complete and move on. You can always return to it from the course outline.
        </p>
      </div>
    </article>
  );
}
