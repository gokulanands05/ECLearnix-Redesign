import { PartyPopper } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useApp } from '../store/AppStore';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { TextArea, TextField } from './ui/TextField';
import { useToast } from './ui/Toast';
import { cn } from '../lib/cn';

const years = ['1st year', '2nd year', '3rd year', '4th year', 'PG / PhD'];

export function AmbassadorModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const app = useApp();
  const toast = useToast();
  const [college, setCollege] = useState('');
  const [phone, setPhone] = useState('');
  const [year, setYear] = useState('');
  const [why, setWhy] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const errors = {
    college: !college.trim() ? 'Enter your college name' : undefined,
    phone: !phone.trim() ? 'Enter your phone number' : !/^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/\s/g, '')) ? 'Enter a valid 10-digit Indian mobile number' : undefined,
    year: !year ? 'Choose your year' : undefined,
    why: why.trim().length < 30 ? `Tell us a little more (${Math.max(0, 30 - why.trim().length)} more characters)` : undefined,
  };
  const valid = !Object.values(errors).some(Boolean);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      app.applyAmbassador();
      toast.show('Application sent — we’ll reply within 3 working days');
    }, 900);
  };

  const done = app.ambassadorApplied;

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Campus Ambassador"
      title={done ? 'Application received' : 'Lead events at your college'}
      description={done ? undefined : 'Host workshops, grow your network and earn certificates and goodies for every event you run.'}
      footer={
        done ? (
          <Button onClick={onClose} data-autofocus>
            Back to dashboard
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="ambassador-form" loading={loading}>
              {loading ? 'Sending…' : 'Submit application'}
            </Button>
          </>
        )
      }
    >
      {done ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-highlight">
            <PartyPopper size={28} className="text-ink" aria-hidden />
          </span>
          <p className="t-heading-s text-ink">Thanks, {app.user?.name.split(' ')[0]}!</p>
          <p className="t-body-m max-w-[380px] text-body">Our campus team will email {app.user?.email} within 3 working days with next steps.</p>
        </div>
      ) : (
        <form id="ambassador-form" noValidate onSubmit={submit} className="flex flex-col gap-4">
          <TextField label="Full name" value={app.user?.name ?? ''} disabled readOnly />
          <TextField label="College" placeholder="e.g. Kumaraguru College of Technology" value={college} onChange={(e) => setCollege(e.target.value)} error={submitted ? errors.college : undefined} required />
          <TextField label="Phone" type="tel" inputMode="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} error={submitted ? errors.phone : undefined} required />
          <fieldset className="flex flex-col gap-1.5">
            <legend className="t-label-m mb-1.5 text-ink">Year of study</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  role="radio"
                  aria-checked={year === y}
                  onClick={() => setYear(y)}
                  className={cn(
                    't-label-m h-[38px] rounded-full px-4 transition-colors',
                    year === y ? 'bg-ink text-white' : 'bg-field text-ink hover:bg-lavender',
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
            {submitted && errors.year && (
              <p className="t-label-s text-danger" role="alert">
                {errors.year}
              </p>
            )}
          </fieldset>
          <TextArea
            label="Why do you want to be an ambassador?"
            placeholder="A couple of lines about events you’d like to run…"
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            error={submitted ? errors.why : undefined}
            hint={`${why.trim().length}/30 characters minimum`}
            rows={3}
          />
        </form>
      )}
    </Modal>
  );
}
