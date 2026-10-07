import type { AppNotification, LiveEvent } from './types';

export const events: LiveEvent[] = [
  {
    id: 'first-abstract',
    day: '05',
    month: 'OCT',
    title: 'Writing your first abstract',
    subtitle: 'Tonight, 7:00 PM · Live workshop with an industry expert',
    tag: 'FREE',
    tint: 'lavender',
    action: 'join',
    description:
      'A 60-minute live workshop on structuring a 250-word abstract: context, gap, method, result, meaning. Bring a draft — the expert will review three live.',
  },
  {
    id: 'innovation-hackathon',
    day: '14',
    month: 'NOV',
    title: '48-hour Innovation Hackathon',
    subtitle: 'Online · via All College Event',
    tag: 'HACKATHON',
    tint: 'peach',
    action: 'register',
    description:
      'Teams of 2–4 build a working prototype for a campus problem in 48 hours. Mentors from partner companies, prizes and certificates for every finisher.',
  },
  {
    id: 'research-conference',
    day: '09',
    month: 'DEC',
    title: 'International Research Conference',
    subtitle: 'Hybrid · Global Conference Hub',
    tag: 'CONFERENCE',
    tint: 'butter',
    action: 'details',
    description:
      'Present your paper or poster to an international panel. Accepted papers are considered for publication with ECLearnix family journals.',
  },
  {
    id: 'lit-review-masterclass',
    day: '21',
    month: 'OCT',
    title: 'Literature review in a weekend',
    subtitle: 'Sat, 10:00 AM · Master class',
    tag: 'MASTER CLASS',
    tint: 'highlight',
    action: 'register',
    description: 'A hands-on master class on building a literature matrix and finding the gap your research fills.',
  },
];

export const initialNotifications: AppNotification[] = [
  { id: 'n1', title: 'Live tonight at 7:00 PM', body: 'Writing your first abstract starts in a few hours.', time: '2h', read: false, kind: 'event' },
  { id: 'n2', title: 'Certificate issued', body: 'Scientific Paper Writing — add it to LinkedIn.', time: '1d', read: false, kind: 'certificate' },
  { id: 'n3', title: 'Keep your streak going', body: 'You are on a 7-day streak. One lesson today keeps it alive.', time: '1d', read: true, kind: 'streak' },
  { id: 'n4', title: 'New lesson unlocked', body: 'Framing a strong research question is ready.', time: '3d', read: true, kind: 'course' },
];
