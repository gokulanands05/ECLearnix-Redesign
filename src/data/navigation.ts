import { Award, BookOpen, Bookmark, CalendarDays, Compass, House, SquarePlay } from 'lucide-react';

export const navItems = [
  { to: '/app', label: 'Home', icon: House, end: true },
  { to: '/app/learning', label: 'My learning', icon: BookOpen },
  { to: '/app/explore', label: 'Explore courses', icon: Compass },
  { to: '/app/master-classes', label: 'Master classes', icon: SquarePlay },
  { to: '/app/events', label: 'Events', icon: CalendarDays },
  { to: '/app/certificates', label: 'Certificates', icon: Award },
  { to: '/app/saved', label: 'Saved', icon: Bookmark },
];

export const weekDays = [
  { d: 'M', label: 'Monday' },
  { d: 'T', label: 'Tuesday' },
  { d: 'W', label: 'Wednesday' },
  { d: 'T', label: 'Thursday' },
  { d: 'F', label: 'Friday' },
  { d: 'S', label: 'Saturday' },
  { d: 'S', label: 'Sunday' },
];
