import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import { CertificatesPage, EventsPage, ExplorePage, MasterClassesPage, MyLearningPage, SavedPage } from './pages/AppPages';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import LessonPage from './pages/Lesson';
import Onboarding from './pages/Onboarding';
import { useApp } from './store/AppStore';

function RequireAuth({ children, onboarded = true }: { children: ReactNode; onboarded?: boolean }) {
  const app = useApp();
  const location = useLocation();
  if (!app.user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (onboarded && !app.onboarded) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: ReactNode }) {
  const app = useApp();
  if (app.user && app.onboarded) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

const titles: [RegExp, string][] = [
  [/^\/$/, 'ECLearnix — Research skills for the career you want'],
  [/^\/signup/, 'Create your account · ECLearnix'],
  [/^\/login/, 'Log in · ECLearnix'],
  [/^\/onboarding/, 'Get started · ECLearnix'],
  [/^\/learn/, 'Lesson · ECLearnix'],
  [/^\/app/, 'Dashboard · ECLearnix'],
];

function DocumentTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = titles.find(([re]) => re.test(pathname))?.[1] ?? 'ECLearnix';
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <DocumentTitle />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<GuestOnly><Auth initialMode="signup" /></GuestOnly>} />
        <Route path="/login" element={<GuestOnly><Auth initialMode="login" /></GuestOnly>} />
        <Route path="/onboarding" element={<RequireAuth onboarded={false}><Onboarding /></RequireAuth>} />
        <Route path="/app" element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="learning" element={<MyLearningPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="master-classes" element={<MasterClassesPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="saved" element={<SavedPage />} />
        </Route>
        <Route path="/learn/:lessonId" element={<RequireAuth><LessonPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
