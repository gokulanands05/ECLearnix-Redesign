export type TopicId =
  | 'research'
  | 'writing'
  | 'journal'
  | 'literature'
  | 'uiux'
  | 'webdev'
  | 'hackathons'
  | 'emerging';

export type CategoryId = 'all' | 'research' | 'writing' | 'journal' | 'uiux' | 'webdev' | 'emerging' | 'hackathons' | 'conferences';

export interface Course {
  id: string;
  title: string;
  /** Short label used in "ECLearnix · Research" meta lines */
  area: string;
  /** Topic used by the starter path / onboarding preview */
  topic: TopicId;
  categories: CategoryId[];
  meta: string;
  pathMeta: string;
  cover: string;
  coverTint: string;
  coverPosition?: string;
  lessons: number;
  description: string;
  duration: string;
}

export interface LiveEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  subtitle: string;
  tag: string;
  tint: 'lavender' | 'peach' | 'butter' | 'highlight';
  action: 'join' | 'register' | 'details';
  description: string;
}

export type LessonKind = 'Video' | 'Reading' | 'Quiz';

export interface Lesson {
  id: string;
  title: string;
  kind: LessonKind;
  minutes: number;
  questions?: number;
  /** seconds — only for videos */
  duration?: number;
}

export interface Module {
  id: string;
  number: number;
  title: string;
  lessons: Lesson[];
}

export interface TranscriptLine {
  at: number; // seconds
  text: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  why: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  kind: 'event' | 'certificate' | 'streak' | 'course';
}
