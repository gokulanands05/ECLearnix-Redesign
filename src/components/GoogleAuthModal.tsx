import { ChevronRight, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initials } from '../lib/format';
import { useApp } from '../store/AppStore';
import { Modal } from './ui/Modal';
import { Avatar, GoogleMark } from './ui/primitives';
import { useToast } from './ui/Toast';

const demoAccounts = [
  { name: 'Gokulanand', email: 'anand@gmail.com', tint: 'bg-peach' },
  { name: 'Kavya Sundaram', email: 'kavya.s@college.edu.in', tint: 'bg-lavender' },
];

/** Mock "Sign in with Google" account chooser. */
export function GoogleAuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const app = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [pending, setPending] = useState<string | null>(null);

  const choose = (acc: { name: string; email: string }) => {
    setPending(acc.email);
    window.setTimeout(() => {
      const returning = app.user?.email === acc.email && app.onboarded;
      if (returning) app.logIn(acc);
      else app.signUp(acc);
      setPending(null);
      onClose();
      toast.show(returning ? `Welcome back, ${acc.name.split(' ')[0]}` : `Signed in as ${acc.email}`);
      navigate(returning ? '/app' : '/onboarding');
    }, 700);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={
        <span className="flex items-center gap-3">
          <GoogleMark /> Choose an account
        </span>
      }
      description="to continue to ECLearnix"
    >
      <ul className="flex flex-col gap-1" aria-label="Google accounts">
        {demoAccounts.map((acc) => (
          <li key={acc.email}>
            <button
              type="button"
              onClick={() => choose(acc)}
              disabled={Boolean(pending)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-subtle disabled:opacity-60"
            >
              <Avatar initials={initials(acc.name, acc.email)} tint={acc.tint} className="border-0" />
              <span className="min-w-0 flex-1">
                <span className="t-label-m block text-ink">{acc.name}</span>
                <span className="t-body-s block truncate text-body">{acc.email}</span>
              </span>
              {pending === acc.email ? (
                <span className="size-5 animate-spin rounded-full border-2 border-brand border-t-transparent" aria-label="Signing in" />
              ) : (
                <ChevronRight size={18} className="text-muted" aria-hidden />
              )}
            </button>
          </li>
        ))}
        <li className="mt-1 border-t border-line pt-1">
          <button
            type="button"
            disabled={Boolean(pending)}
            onClick={() => {
              onClose();
              navigate('/signup');
            }}
            className="t-label-m flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-ink hover:bg-subtle"
          >
            <span className="grid size-10 place-items-center rounded-full bg-field">
              <UserPlus size={18} aria-hidden />
            </span>
            Use another account
          </button>
        </li>
      </ul>
      <p className="t-body-s mt-4 text-muted">Demo only — no data leaves your browser.</p>
    </Modal>
  );
}
