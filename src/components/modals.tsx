import { Award, Bookmark, CalendarDays, Check, Clock, ListChecks } from 'lucide-react';
import type { CatalogCourse } from '../data/courses';
import type { LiveEvent } from '../data/types';
import { CourseCover } from './cards';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { Badge } from './ui/primitives';

export function CourseDetailsModal({
  course,
  onClose,
  saved,
  onToggleSave,
  primary,
}: {
  course: CatalogCourse | null;
  onClose: () => void;
  saved: boolean;
  onToggleSave: () => void;
  primary: { label: string; onClick: () => void };
}) {
  return (
    <Modal
      open={Boolean(course)}
      onClose={onClose}
      eyebrow={course ? `ECLearnix · ${course.area}` : ''}
      title={course?.title ?? ''}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onToggleSave}
            aria-pressed={saved}
            leading={<Bookmark size={16} fill={saved ? 'currentColor' : 'none'} aria-hidden />}
          >
            {saved ? 'Saved' : 'Save for later'}
          </Button>
          <Button onClick={primary.onClick} data-autofocus>
            {primary.label}
          </Button>
        </>
      }
    >
      {course && (
        <div className="flex flex-col gap-5">
          <CourseCover course={course} className="h-44 w-full rounded-lg" />
          <p className="t-body-m text-body">{course.description}</p>
          <dl className="grid grid-cols-3 gap-3">
            {[
              { icon: <ListChecks size={18} aria-hidden />, k: 'Lessons', v: String(course.lessons) },
              { icon: <Clock size={18} aria-hidden />, k: 'Length', v: course.duration },
              { icon: <Award size={18} aria-hidden />, k: 'Certificate', v: 'Included' },
            ].map((d) => (
              <div key={d.k} className="rounded-md bg-subtle p-3">
                <dt className="t-label-s flex items-center gap-1.5 text-muted">
                  {d.icon}
                  {d.k}
                </dt>
                <dd className="t-label-l mt-1 text-ink">{d.v}</dd>
              </div>
            ))}
          </dl>
          <ul className="flex flex-col gap-2">
            {['Self-paced — learn on your schedule', 'Small project to apply what you learn', 'Certificate you can add to LinkedIn'].map((t) => (
              <li key={t} className="t-body-s flex items-center gap-2 text-ink">
                <span className="grid size-5 place-items-center rounded-full bg-success-bg">
                  <Check size={12} strokeWidth={3} className="text-success" aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}

export function EventDetailsModal({
  event,
  onClose,
  registered,
  onToggle,
}: {
  event: LiveEvent | null;
  onClose: () => void;
  registered: boolean;
  onToggle: () => void;
}) {
  const verb = event?.action === 'join' ? 'Join' : 'Register';
  return (
    <Modal
      open={Boolean(event)}
      onClose={onClose}
      eyebrow={event ? `${event.day} ${event.month} · ${event.tag}` : ''}
      title={event?.title ?? ''}
      description={event?.subtitle}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            variant={registered ? 'secondary' : 'primary'}
            onClick={onToggle}
            data-autofocus
            leading={registered ? <Check size={16} strokeWidth={2.5} className="text-success" aria-hidden /> : undefined}
          >
            {registered ? (event?.action === 'join' ? 'Joined — leave' : 'Registered — cancel') : event?.action === 'details' ? 'Register interest' : verb}
          </Button>
        </>
      }
    >
      {event && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Badge tint={event.tint === 'lavender' ? 'highlight' : event.tint}>{event.tag}</Badge>
            <span className="t-label-s flex items-center gap-1.5 text-muted">
              <CalendarDays size={14} aria-hidden /> {event.day} {event.month} 2026
            </span>
          </div>
          <p className="t-body-m text-body">{event.description}</p>
        </div>
      )}
    </Modal>
  );
}
