import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { initialNotifications } from '../data/events';
import { CORE_LESSON_IDS, CURRENT_LESSON_ID, initialCompleted } from '../data/lessons';
import type { RoleId } from '../data/onboarding';
import type { AppNotification, TopicId } from '../data/types';

export interface User {
  name: string;
  email: string;
}

export interface Note {
  id: string;
  lessonId: string;
  at: number;
  text: string;
  createdAt: number;
}

export interface Certificate {
  courseId: string;
  issued: string;
  onLinkedIn: boolean;
}

interface State {
  user: User | null;
  onboarded: boolean;
  role: RoleId | null;
  interests: TopicId[];
  weeklyGoal: number;
  lessonsThisWeek: number;
  completed: string[];
  currentLessonId: string;
  saved: string[];
  registeredEvents: string[];
  notes: Note[];
  notifications: AppNotification[];
  streak: number;
  bestStreak: number;
  certificates: Certificate[];
  ambassadorApplied: boolean;
}

const initialState: State = {
  user: null,
  onboarded: false,
  role: 'student',
  interests: ['research', 'writing', 'uiux'],
  weeklyGoal: 5,
  lessonsThisWeek: 3,
  completed: initialCompleted,
  currentLessonId: CURRENT_LESSON_ID,
  saved: [],
  registeredEvents: [],
  notes: [],
  notifications: initialNotifications,
  streak: 7,
  bestStreak: 12,
  certificates: [{ courseId: 'scientific-paper-writing', issued: 'Oct 2026', onLinkedIn: false }],
  ambassadorApplied: false,
};

const STORAGE_KEY = 'eclearnix:v1';

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable — start fresh */
  }
  return initialState;
}

interface Actions {
  signUp: (user: User) => void;
  logIn: (user: User) => void;
  logOut: () => void;
  setRole: (role: RoleId) => void;
  toggleInterest: (topic: TopicId) => void;
  setInterests: (topics: TopicId[]) => void;
  setWeeklyGoal: (lessons: number) => void;
  completeOnboarding: () => void;
  setLessonComplete: (lessonId: string, done: boolean) => void;
  setCurrentLesson: (lessonId: string) => void;
  toggleSaved: (courseId: string) => boolean;
  toggleEvent: (eventId: string) => boolean;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  removeNote: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addCertificateToLinkedIn: (courseId: string) => void;
  applyAmbassador: () => void;
  resetDemo: () => void;
}

interface Derived {
  courseProgress: number;
  coreDone: number;
  coreTotal: number;
  unreadCount: number;
}

type Store = State & Actions & Derived;

const Ctx = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load);
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const patch = useCallback((p: Partial<State> | ((s: State) => Partial<State>)) => {
    setState((s) => ({ ...s, ...(typeof p === 'function' ? p(s) : p) }));
  }, []);

  const actions: Actions = useMemo(
    () => ({
      signUp: (user) => patch({ user, onboarded: false }),
      logIn: (user) => patch((s) => ({ user: s.user && s.user.email === user.email ? s.user : user })),
      logOut: () => patch({ user: null }),
      setRole: (role) => patch({ role }),
      toggleInterest: (topic) =>
        patch((s) => ({ interests: s.interests.includes(topic) ? s.interests.filter((t) => t !== topic) : [...s.interests, topic] })),
      setInterests: (interests) => patch({ interests }),
      setWeeklyGoal: (weeklyGoal) => patch({ weeklyGoal }),
      completeOnboarding: () => patch({ onboarded: true }),
      setLessonComplete: (lessonId, done) =>
        patch((s) => {
          const has = s.completed.includes(lessonId);
          if (done === has) return {};
          return {
            completed: done ? [...s.completed, lessonId] : s.completed.filter((id) => id !== lessonId),
            lessonsThisWeek: Math.max(0, s.lessonsThisWeek + (done ? 1 : -1)),
          };
        }),
      setCurrentLesson: (currentLessonId) => patch({ currentLessonId }),
      toggleSaved: (courseId) => {
        const nowSaved = !stateRef.current.saved.includes(courseId);
        patch((s) => ({ saved: nowSaved ? [...s.saved, courseId] : s.saved.filter((id) => id !== courseId) }));
        return nowSaved;
      },
      toggleEvent: (eventId) => {
        const nowOn = !stateRef.current.registeredEvents.includes(eventId);
        patch((s) => ({
          registeredEvents: nowOn ? [...s.registeredEvents, eventId] : s.registeredEvents.filter((id) => id !== eventId),
        }));
        return nowOn;
      },
      addNote: (note) =>
        patch((s) => ({ notes: [{ ...note, id: crypto.randomUUID(), createdAt: Date.now() }, ...s.notes] })),
      removeNote: (id) => patch((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      markNotificationRead: (id) =>
        patch((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotificationsRead: () => patch((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      addCertificateToLinkedIn: (courseId) =>
        patch((s) => ({ certificates: s.certificates.map((c) => (c.courseId === courseId ? { ...c, onLinkedIn: true } : c)) })),
      applyAmbassador: () => patch({ ambassadorApplied: true }),
      resetDemo: () => setState((s) => ({ ...initialState, user: s.user, onboarded: s.onboarded })),
    }),
    [patch],
  );

  const derived: Derived = useMemo(() => {
    const coreDone = CORE_LESSON_IDS.filter((id) => state.completed.includes(id)).length;
    return {
      coreDone,
      coreTotal: CORE_LESSON_IDS.length,
      courseProgress: Math.floor((coreDone / CORE_LESSON_IDS.length) * 100),
      unreadCount: state.notifications.filter((n) => !n.read).length,
    };
  }, [state.completed, state.notifications]);

  const value = useMemo(() => ({ ...state, ...actions, ...derived }), [state, actions, derived]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppStoreProvider');
  return ctx;
}
