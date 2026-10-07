# ECLearnix

A working React build of the ECLearnix Figma file (`Brief-arvnd`, section **To Develop** · node `927:4947`) — landing page, sign up / log in, onboarding, learner dashboard and lesson player.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

Demo log in: `anand@gmail.com` with any 8+ character password — or use **Continue with Google** (mock account chooser). All data is mock and saved to `localStorage`; use **Avatar → Reset demo progress** to start over.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · React Router · Lucide icons · Bricolage Grotesque + Figtree (self-hosted via Fontsource).

## Structure

```
src/
  index.css              Figma tokens (colours, radii, shadow) + ECLearnix text styles as Tailwind utilities (t-heading-l, t-label-m …)
  data/                  Mock data, kept out of the UI so it can be swapped for an API
    courses.ts           catalogue, categories, starter-path builder
    lessons.ts           course outline, transcript, quiz, resources, discussion
    events.ts            live events + notifications
    onboarding.ts        topics, roles, weekly goals
    navigation.ts        side-nav items, week days
  store/AppStore.tsx     App state (user, interests, goal, progress, saved, events, notes…) persisted to localStorage
  components/
    ui/                  Button, IconButton, TextField/TextArea, Popover (portal dropdown), Modal, Toast, Logo, Chip, Badge, Avatar, Progress, ProgressRing, EmptyState
    cards.tsx            TopicCard, CourseCard, PathCard, EventRow, LessonRow, StreakDay, CertStep
    SearchBox.tsx        combobox search with live suggestions
    GoogleAuthModal.tsx  mock Google sign-in
    AmbassadorModal.tsx  Campus Ambassador application form
    Quiz.tsx             one-question-at-a-time quiz with feedback + score
    lesson/              VideoPlayer, LessonTabs (Transcript / Notes / Resources / Discussion)
  layouts/AppShell.tsx   side nav + top bar (streak, notifications, account menu) for /app routes
  pages/                 Landing, Auth (sign up + log in), Onboarding, Dashboard, Lesson, AppPages (My learning, Explore, Master classes, Events, Certificates, Saved)
  assets/                Images and SVGs exported from the Figma file
```

## Pages vs. states

| Route | Figma frame | Notes |
| --- | --- | --- |
| `/` | Landing page UI | chips filter the course grid, Browse dropdown, search, schedule modal |
| `/signup`, `/login` | Webapp Sign Up | one screen; log in is a mode of the same form |
| `/onboarding` | Webapp Onboarding | Your role → Interests → Weekly goal are steps in state, not pages |
| `/app` (+ sub-pages) | Webapp Dashboard | sub-pages reuse the dashboard components for the side-nav items |
| `/learn/:lessonId` | Webapp Lesson | tabs, player, quiz and outline are all component state |

## Notes

- Figma's `opsz 14` font-variation hint is dropped in favour of automatic optical sizing — that is what matches the line breaks in the Figma renders.
- Lesson video is simulated (no media file): the poster is the Figma lesson image and the clock, seek, speed, captions, mute and fullscreen all behave like a real player. Shortcuts: Space/K, J/L (±10 s), M, C, F.
- The video starts paused rather than auto-playing (Figma shows it mid-playback at 4:12).
- Role and Weekly-goal onboarding steps are not drawn in Figma; they reuse the Topic Card layout from the Interests step.
