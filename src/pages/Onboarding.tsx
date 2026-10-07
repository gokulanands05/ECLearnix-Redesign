import { ArrowLeft, ArrowRight, Award, Check, MousePointerClick } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TopicCard } from '../components/cards';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import { starterPath } from '../data/courses';
import { roles, topics, weeklyGoals } from '../data/onboarding';
import { cn } from '../lib/cn';
import { firstName } from '../lib/format';
import { useApp } from '../store/AppStore';

const steps = [
  { id: 'role', label: 'Your role' },
  { id: 'interests', label: 'Interests' },
  { id: 'goal', label: 'Weekly goal' },
] as const;
type StepId = (typeof steps)[number]['id'];

const numberColors = ['bg-highlight', 'bg-coral', 'bg-brand-soft', 'bg-lavender', 'bg-peach', 'bg-mint', 'bg-butter', 'bg-highlight'];

export default function Onboarding() {
  const app = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const initial = (params.get('step') as StepId) ?? 'role';
  const editing = params.get('edit') === '1';
  const [stepIdx, setStepIdx] = useState(Math.max(0, steps.findIndex((s) => s.id === initial)));
  const step = steps[stepIdx].id;
  const path = starterPath(app.interests);
  const name = firstName(app.user?.name);

  const finish = (skipped = false) => {
    app.completeOnboarding();
    if (editing) {
      toast.show('Interests updated — your starter path has changed');
    } else {
      toast.show(skipped ? 'You can personalise your path anytime from the dashboard' : `You're all set, ${name}! Your starter path is ready.`, {
        tone: skipped ? 'info' : 'success',
      });
    }
    navigate('/app');
  };

  const next = () => {
    if (editing || stepIdx === steps.length - 1) return finish();
    setStepIdx((i) => i + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const back = () => {
    if (editing) return navigate('/app');
    if (stepIdx === 0) return navigate(-1);
    setStepIdx((i) => i - 1);
  };

  const canContinue = step === 'role' ? Boolean(app.role) : step === 'interests' ? app.interests.length > 0 : app.weeklyGoal > 0;
  const continueLabel =
    step === 'interests'
      ? editing
        ? `Save · ${app.interests.length} selected`
        : `Continue · ${app.interests.length} selected`
      : step === 'goal'
        ? 'Start learning'
        : 'Continue';

  return (
    <div className="min-h-screen bg-page">
      <header className="sticky top-0 z-30 border-b border-line bg-page">
        <div className="relative mx-auto flex h-[73px] max-w-[1440px] items-center justify-between gap-4 px-5 lg:px-20">
          <Logo />
          <nav aria-label="Onboarding progress" className="absolute left-1/2 hidden w-[420px] -translate-x-1/2 md:block">
            <ol className="flex flex-col gap-2">
              <li className="flex gap-1.5" aria-hidden>
                {steps.map((s, i) => (
                  <span key={s.id} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-300', i <= stepIdx ? 'bg-brand' : 'bg-line')} />
                ))}
              </li>
              <li className="flex gap-1.5">
                {steps.map((s, i) => {
                  const done = i < stepIdx;
                  const current = i === stepIdx;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={i > stepIdx || editing}
                      onClick={() => setStepIdx(i)}
                      aria-current={current ? 'step' : undefined}
                      className={cn(
                        't-label-s flex-1 text-left transition-colors disabled:cursor-default',
                        done && 'text-success hover:underline hover:underline-offset-2',
                        current && 'text-brand',
                        !done && !current && 'text-muted',
                      )}
                    >
                      {done && '✓ '}
                      {s.label}
                      <span className="sr-only">{done ? ' (completed)' : current ? ' (current step)' : ''}</span>
                    </button>
                  );
                })}
              </li>
            </ol>
          </nav>
          {editing ? (
            <button type="button" onClick={() => navigate('/app')} className="t-label-l text-body hover:text-ink">
              Cancel
            </button>
          ) : (
            <button type="button" onClick={() => finish(true)} className="t-label-l text-body hover:text-ink">
              Skip for now
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-10 px-5 pt-10 pb-12 lg:flex-row lg:items-start lg:gap-5 lg:px-20 lg:pt-[50px]">
        <section className="flex w-full max-w-[738px] flex-col lg:min-h-[758px] lg:pt-[19px]" aria-labelledby="step-title">
          <p className="t-label-l text-brand md:hidden">
            Step {stepIdx + 1} of {steps.length} · {steps[stepIdx].label}
          </p>
          <p className="t-label-l mt-2 text-brand md:mt-0">{editing ? 'Your interests' : `Great to meet you, ${name}.`}</p>
          <h1 id="step-title" className="t-heading-l mt-6 text-ink">
            {step === 'role' ? 'What best describes you?' : step === 'interests' ? 'What do you want to learn?' : 'Set a weekly goal'}
          </h1>
          <p className="t-body-m mt-6 text-body">
            {step === 'role'
              ? 'We’ll tailor courses, events and examples to where you are.'
              : step === 'interests'
                ? 'Pick as many as you like — we’ll build your starter path from these.'
                : 'Small, steady progress beats cramming. You can change this anytime.'}
          </p>

          <div key={step} className="mt-6 grid animate-fade grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4" role={step === 'interests' ? 'group' : 'radiogroup'} aria-labelledby="step-title">
            {step === 'role' &&
              roles.map((r) => (
                <TopicCard
                  key={r.id}
                  mode="radio"
                  icon={r.icon}
                  tile={r.tile}
                  iconColor={r.iconColor}
                  title={r.title}
                  description={r.description}
                  selected={app.role === r.id}
                  onToggle={() => app.setRole(r.id)}
                />
              ))}
            {step === 'interests' &&
              topics.map((t) => (
                <TopicCard
                  key={t.id}
                  icon={t.icon}
                  tile={t.tile}
                  iconColor={t.iconColor}
                  title={t.title}
                  description={t.description}
                  selected={app.interests.includes(t.id)}
                  onToggle={() => app.toggleInterest(t.id)}
                />
              ))}
            {step === 'goal' &&
              weeklyGoals.map((g) => (
                <GoalCard key={g.lessons} {...g} selected={app.weeklyGoal === g.lessons} onSelect={() => app.setWeeklyGoal(g.lessons)} />
              ))}
          </div>

          {step === 'interests' && app.interests.length === 0 && (
            <p className="t-label-s mt-4 text-streak" role="status">
              Pick at least one topic to continue.
            </p>
          )}

          <div className="mt-10 flex items-center justify-between gap-3 lg:mt-auto">
            <Button size="lg" variant="secondary" onClick={back} leading={<ArrowLeft size={20} strokeWidth={2} aria-hidden />}>
              Back
            </Button>
            <Button size="lg" onClick={next} disabled={!canContinue} trailing={<ArrowRight size={18} strokeWidth={2.25} aria-hidden />}>
              {continueLabel}
            </Button>
          </div>
        </section>

        <aside
          aria-label="Live preview of your starter path"
          className="relative flex w-full flex-col gap-5 overflow-hidden rounded-xl bg-ink px-6 py-5 sm:px-10 lg:ml-auto lg:min-h-[778px] lg:w-[522px] lg:shrink-0"
        >
          <span aria-hidden className="absolute top-[-70px] left-[342px] size-[220px] rounded-full bg-brand" />
          <span aria-hidden className="absolute top-[75px] left-[386px] size-10 rotate-16 rounded-[12px] bg-highlight" />
          <p className="t-overline relative text-highlight">Live preview</p>
          <h2 className="t-heading-m relative text-white">Your starter path</h2>
          <p className="t-body-m relative text-on-dark-muted">
            Updates as you pick topics.
            {step === 'goal' && <span className="text-white"> · {app.weeklyGoal} lessons a week</span>}
          </p>

          <ol className="relative flex flex-col gap-5" aria-live="polite">
            {path.length === 0 ? (
              <li className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-white/20 px-6 py-10 text-center">
                <MousePointerClick size={24} className="text-highlight" aria-hidden />
                <p className="t-label-l text-white">Nothing here yet</p>
                <p className="t-body-s text-on-dark-muted">Pick a topic on the left and a course will appear here.</p>
              </li>
            ) : (
              path.slice(0, 5).map((c, i) => (
                <li key={c.id} className="flex animate-pop items-start gap-3.5 rounded-lg bg-ink-raised p-4">
                  <span className={cn('t-label-l grid size-[34px] shrink-0 place-items-center rounded-full text-ink', numberColors[i])}>{i + 1}</span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="t-label-l text-white">{c.title}</span>
                    <span className="t-label-s text-on-dark-muted">{c.pathMeta}</span>
                  </span>
                </li>
              ))
            )}
            {path.length > 5 && <li className="t-label-m relative text-on-dark-muted">+ {path.length - 5} more in your path</li>}
          </ol>

          <div className="flex-1" />
          <div className="relative flex items-center gap-3 rounded-lg bg-highlight p-4">
            <Award size={24} strokeWidth={2} className="shrink-0 text-ink" aria-hidden />
            <p className="t-label-m text-ink">Finish your path to earn a certificate for each course.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function GoalCard({
  lessons,
  title,
  description,
  tile,
  selected,
  onSelect,
}: {
  lessons: number;
  title: string;
  description: string;
  tile: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'group relative flex min-h-[174px] w-full flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-[background,border-color,transform] duration-150 active:scale-[0.985]',
        selected ? 'border-brand bg-brand-tint' : 'border-line bg-page hover:border-line-strong hover:bg-subtle',
      )}
    >
      <span className={cn('t-heading-s grid size-[42px] place-items-center rounded-sm text-ink', tile)}>{lessons}</span>
      <span className="t-label-l text-ink">{title}</span>
      <span className="t-body-s text-body">{description}</span>
      <span
        aria-hidden
        className={cn(
          'absolute top-2.5 right-2.5 grid size-6 place-items-center rounded-full',
          selected ? 'bg-brand' : 'border-2 border-line-strong bg-page group-hover:border-[#cbc6e2]',
        )}
      >
        {selected && <Check size={13} strokeWidth={3} className="text-white" />}
      </span>
    </button>
  );
}
