import type { TopicId } from './types';

export interface Topic {
  id: TopicId;
  title: string;
  description: string;
  icon: 'flask' | 'pen' | 'book' | 'search' | 'layout' | 'code' | 'trophy' | 'sparkle';
  /** Tile background + icon colour from the Topic Card instances */
  tile: string;
  iconColor: string;
}

export const topics: Topic[] = [
  { id: 'research', title: 'Research methodology', description: 'Questions, methods, study design', icon: 'flask', tile: 'bg-lavender', iconColor: 'text-brand' },
  { id: 'writing', title: 'Academic & writing', description: 'Papers, abstracts, reports', icon: 'pen', tile: 'bg-lavender', iconColor: 'text-streak' },
  { id: 'journal', title: 'Journal & publishing', description: 'Journals, reviews, indexing', icon: 'book', tile: 'bg-butter', iconColor: 'text-ink' },
  { id: 'literature', title: 'Literature & review', description: 'Find, read and cite sources', icon: 'search', tile: 'bg-lavender', iconColor: 'text-brand' },
  { id: 'uiux', title: 'UI/UX design & test', description: 'Research users, design screens', icon: 'layout', tile: 'bg-[rgba(30,138,76,0.15)]', iconColor: 'text-success' },
  { id: 'webdev', title: 'Web & app development', description: 'Build and ship real projects', icon: 'code', tile: 'bg-lavender', iconColor: 'text-brand' },
  { id: 'hackathons', title: 'Hackathons & events', description: 'Compete and get noticed', icon: 'trophy', tile: 'bg-highlight', iconColor: 'text-ink' },
  { id: 'emerging', title: 'Emerging technology', description: 'New tools and methods', icon: 'sparkle', tile: 'bg-[rgba(226,83,31,0.2)]', iconColor: 'text-streak' },
];

export type RoleId = 'student' | 'faculty' | 'researcher' | 'professional';

export const roles: { id: RoleId; title: string; description: string; icon: 'graduation' | 'presentation' | 'flask' | 'briefcase'; tile: string; iconColor: string }[] = [
  { id: 'student', title: 'College student', description: 'UG or PG, building skills for projects and placements', icon: 'graduation', tile: 'bg-lavender', iconColor: 'text-brand' },
  { id: 'faculty', title: 'Faculty member', description: 'Teaching, guiding projects, publishing research', icon: 'presentation', tile: 'bg-peach', iconColor: 'text-streak' },
  { id: 'researcher', title: 'Research scholar', description: 'PhD or research staff working on a thesis or paper', icon: 'flask', tile: 'bg-butter', iconColor: 'text-ink' },
  { id: 'professional', title: 'Working professional', description: 'Upskilling for a new role or a better one', icon: 'briefcase', tile: 'bg-mint', iconColor: 'text-success' },
];

export const weeklyGoals: { lessons: number; title: string; description: string; tile: string }[] = [
  { lessons: 3, title: 'Casual', description: '3 lessons a week · about 30 min', tile: 'bg-mint' },
  { lessons: 5, title: 'Regular', description: '5 lessons a week · about 50 min', tile: 'bg-lavender' },
  { lessons: 7, title: 'Serious', description: '7 lessons a week · about 70 min', tile: 'bg-peach' },
  { lessons: 10, title: 'Intense', description: '10 lessons a week · about 2 hours', tile: 'bg-highlight' },
];
