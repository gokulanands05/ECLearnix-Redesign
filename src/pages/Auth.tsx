import { ArrowRight, Award, Check, ChevronRight, Flame } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { Button } from '../components/ui/Button';
import { Logo, Progress, GoogleMark } from '../components/ui/primitives';
import { TextField } from '../components/ui/TextField';
import { useToast } from '../components/ui/Toast';
import { cn } from '../lib/cn';
import { firstName, isEmail } from '../lib/format';
import { useApp } from '../store/AppStore';

type Mode = 'signup' | 'login';
type Field = 'name' | 'email' | 'password';
const DEMO_EMAIL = 'anand@gmail.com';

export default function Auth({ initialMode }: { initialMode: Mode }) {
  const app = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState<Record<Field, boolean>>({ name: false, email: false, password: false });
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [googleOpen, setGoogleOpen] = useState(false);
  const refs = { name: useRef<HTMLInputElement>(null), email: useRef<HTMLInputElement>(null), password: useRef<HTMLInputElement>(null) };

  // keep URL and mode in sync (Log in ↔ Sign up is a state change on the same screen)
  useEffect(() => setMode(initialMode), [initialMode]);
  const switchMode = (m: Mode) => {
    setMode(m);
    setSubmitted(false);
    setTouched({ name: false, email: false, password: false });
    setFormError(null);
    navigate(m === 'signup' ? '/signup' : '/login', { replace: true, state: location.state });
  };

  const pw = values.password;
  const checks = { length: pw.length >= 8, number: /\d/.test(pw), symbol: /[^A-Za-z0-9]/.test(pw) };

  const errors: Partial<Record<Field, string>> = {};
  if (mode === 'signup') {
    if (!values.name.trim()) errors.name = 'Enter your full name';
    else if (values.name.trim().length < 2) errors.name = 'Name looks too short';
  }
  if (!values.email.trim()) errors.email = 'Enter your email address';
  else if (!isEmail(values.email)) errors.email = 'Enter a valid email, like name@college.edu';
  if (!pw) errors.password = mode === 'signup' ? 'Create a password' : 'Enter your password';
  else if (mode === 'signup' && (!checks.length || !checks.number)) errors.password = 'Use 8+ characters with at least one number';

  const show = (f: Field) => (submitted || touched[f] ? errors[f] : undefined);
  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [f]: e.target.value }));
    setFormError(null);
  };
  const blur = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const order: Field[] = mode === 'signup' ? ['name', 'email', 'password'] : ['email', 'password'];
    const firstBad = order.find((f) => errors[f]);
    if (firstBad) {
      refs[firstBad].current?.focus();
      return;
    }
    const email = values.email.trim().toLowerCase();
    setStatus('loading');
    window.setTimeout(() => {
      if (mode === 'signup') {
        if (app.user && app.user.email === email && app.onboarded) {
          setStatus('idle');
          setFormError('An account with this email already exists.');
          return;
        }
        setStatus('success');
        window.setTimeout(() => {
          app.signUp({ name: values.name.trim(), email });
          toast.show(`Welcome to ECLearnix, ${firstName(values.name)}!`);
          navigate('/onboarding');
        }, 650);
      } else {
        const known = app.user?.email === email || email === DEMO_EMAIL;
        if (!known) {
          setStatus('idle');
          setFormError('We couldn’t find an account with that email.');
          return;
        }
        if (pw.length < 8) {
          setStatus('idle');
          setFormError('That password doesn’t look right. Try again.');
          refs.password.current?.focus();
          return;
        }
        setStatus('success');
        window.setTimeout(() => {
          const user = app.user?.email === email ? app.user : { name: 'Gokulanand', email };
          app.logIn(user);
          if (email === DEMO_EMAIL && !app.onboarded) app.completeOnboarding();
          toast.show(`Welcome back, ${firstName(user.name)}`);
          const from = (location.state as { from?: string } | null)?.from;
          navigate(from ?? '/app');
        }, 500);
      }
    }, 900);
  };

  const isSignup = mode === 'signup';

  return (
    <div className="min-h-screen bg-page lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="flex min-h-screen flex-col px-5 pt-8 pb-10 sm:px-10 lg:px-20 lg:pt-14">
        <Logo />
        <div className="flex flex-1 items-center py-10">
          <form noValidate onSubmit={onSubmit} className="flex w-full max-w-[420px] flex-col gap-4" aria-labelledby="auth-title">
            <div className="flex flex-col gap-2">
              <h1 id="auth-title" className="t-heading-l text-ink">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="t-body-m text-body">
                {isSignup ? 'Join 5,00,000+ students learning research the right way.' : 'Log in to pick up where you left off.'}
              </p>
            </div>

            <Button size="lg" variant="secondary" block leading={<GoogleMark />} onClick={() => setGoogleOpen(true)}>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3" aria-hidden>
              <span className="h-px flex-1 bg-line" />
              <span className="t-label-s text-muted">{isSignup ? 'or sign up with email' : 'or log in with email'}</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            {formError && (
              <div role="alert" className="t-body-s flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-danger-bg px-4 py-3 text-danger">
                <span className="font-semibold">{formError}</span>
                <button type="button" className="t-label-m text-ink underline underline-offset-2" onClick={() => switchMode(isSignup ? 'login' : 'signup')}>
                  {isSignup ? 'Log in instead' : 'Create an account'}
                </button>
              </div>
            )}

            {isSignup && (
              <TextField
                ref={refs.name}
                label="Full Name"
                name="name"
                autoComplete="name"
                placeholder="Your full name"
                value={values.name}
                onChange={set('name')}
                onBlur={blur('name')}
                error={show('name')}
                required
              />
            )}
            <TextField
              ref={refs.email}
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@college.edu"
              value={values.email}
              onChange={set('email')}
              onBlur={blur('email')}
              error={show('email')}
              hint={!isSignup ? `Demo account: ${DEMO_EMAIL}` : undefined}
              required
            />
            <TextField
              ref={refs.password}
              label="Password"
              name="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'Create a password' : 'Your password'}
              value={values.password}
              onChange={set('password')}
              onBlur={blur('password')}
              error={!isSignup ? show('password') : submitted || touched.password ? errors.password : undefined}
              required
            />

            {isSignup ? (
              <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Password requirements">
                <PwCheck ok={checks.length} label="8+ characters" />
                <PwCheck ok={checks.number} label="One number" />
                <PwCheck ok={checks.symbol} label="One symbol (optional)" />
              </ul>
            ) : (
              <div className="-mt-1 flex justify-end">
                <button
                  type="button"
                  className="t-label-m text-brand hover:underline hover:underline-offset-4"
                  onClick={() => {
                    if (!isEmail(values.email)) {
                      setTouched((t) => ({ ...t, email: true }));
                      refs.email.current?.focus();
                      toast.show('Enter your email first and we’ll send a reset link', { tone: 'info' });
                      return;
                    }
                    toast.show(`Reset link sent to ${values.email.trim()}`);
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              block
              loading={status === 'loading'}
              className={cn(status === 'success' && 'bg-success hover:bg-success')}
              trailing={status === 'success' ? <Check size={18} strokeWidth={2.5} aria-hidden /> : <ArrowRight size={18} strokeWidth={2.25} aria-hidden />}
            >
              {status === 'loading'
                ? isSignup
                  ? 'Creating account…'
                  : 'Logging in…'
                : status === 'success'
                  ? isSignup
                    ? 'Account created'
                    : 'Logged in'
                  : isSignup
                    ? 'Create account'
                    : 'Log in'}
            </Button>
            <p className="sr-only" aria-live="polite">
              {status === 'success' ? (isSignup ? 'Account created. Taking you to onboarding.' : 'Logged in.') : ''}
            </p>

            {isSignup && (
              <p className="t-body-s text-muted">
                By creating an account you agree to the{' '}
                <a href="#" className="underline-offset-2 hover:text-ink hover:underline">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#" className="underline-offset-2 hover:text-ink hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            )}
            <p className="t-body-m text-body">
              {isSignup ? 'Already have an account? ' : 'New to ECLearnix? '}
              <button type="button" onClick={() => switchMode(isSignup ? 'login' : 'signup')} className="font-bold text-brand hover:underline hover:underline-offset-4">
                {isSignup ? 'Log in' : 'Create an account'}
              </button>
            </p>
          </form>
        </div>
      </div>

      <AuthPanel />
      <GoogleAuthModal open={googleOpen} onClose={() => setGoogleOpen(false)} />
    </div>
  );
}

function PwCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={cn('t-label-s flex items-center gap-1.5 transition-colors', ok ? 'text-success' : 'text-muted')}>
      {ok ? <Check size={14} strokeWidth={2.5} aria-hidden /> : <ChevronRight size={14} strokeWidth={2.5} aria-hidden />}
      {label}
      <span className="sr-only">{ok ? ' — met' : ' — not met yet'}</span>
    </li>
  );
}

function AuthPanel() {
  return (
    <div className="hidden py-14 pr-20 pl-[22px] lg:flex lg:items-center">
      <div className="relative flex h-[912px] max-h-[calc(100vh-112px)] min-h-[720px] w-full flex-col justify-between overflow-hidden rounded-xl bg-brand-soft p-14">
        <span aria-hidden className="absolute top-[-90px] left-[480px] size-[300px] rounded-full bg-highlight" />
        <span aria-hidden className="absolute top-[579px] left-[-75px] size-40 rotate-16 rounded-[46px] bg-coral" />

        <div className="relative flex w-[440px] max-w-full flex-col gap-3.5 text-ink">
          <p className="t-heading-l">Your research journey starts here.</p>
          <p className="t-body-l">Courses, live master classes and certificates — in one place.</p>
        </div>

        <div className="relative">
          <div className="w-[420px] -rotate-2 rounded-lg bg-page p-5 shadow-l">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <p className="t-overline text-muted">Continue learning</p>
                <p className="t-label-m flex items-center gap-[5px] text-streak">
                  <Flame size={15} strokeWidth={2} aria-hidden /> 7-day streak
                </p>
              </div>
              <p className="t-heading-s text-ink">Research Methodology Fundamentals</p>
              <Progress value={62} label="Course progress" />
              <div className="t-label-s flex justify-between text-body">
                <span>62% Complete</span>
                <span>Lesson 3 of 8</span>
              </div>
            </div>
          </div>
          <div className="absolute top-[124px] left-[315px] rotate-4 rounded-lg bg-page py-3.5 pr-4 pl-3.5 shadow-l">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-highlight">
                <Award size={19} strokeWidth={2} className="text-ink" aria-hidden />
              </span>
              <div className="flex flex-col gap-0.5 whitespace-nowrap">
                <p className="t-label-m text-ink">Certificate earned</p>
                <p className="t-label-s text-muted">Scientific Paper Writing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex gap-10 border-t border-ink pt-6 text-ink">
          {[
            ['5,00,000+', 'Students'],
            ['4,000+', 'Colleges'],
            ['91%', 'Research with Confidence'],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col gap-0.5">
              <p className="t-heading-m whitespace-nowrap">{v}</p>
              <p className="t-body-s">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
