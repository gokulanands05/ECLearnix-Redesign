import whiteboard from '../assets/img/course-1.jpg';
import paperWriting from '../assets/img/course-2.jpg';
import journals from '../assets/img/course-3.jpg';
import designBooks from '../assets/img/course-4.jpg';
import pathResearch from '../assets/img/path-1.jpg';
import pathWriting from '../assets/img/path-2.jpg';
import pathUx from '../assets/img/path-3.jpg';
import type { CategoryId, Course, TopicId } from './types';

export interface CatalogCourse extends Course {
  pathCover?: string;
  monogram?: string;
}

export const courses: CatalogCourse[] = [
  {
    id: 'research-methodology',
    title: 'Research Methodology Fundamentals',
    area: 'Research',
    topic: 'research',
    categories: ['all', 'research'],
    meta: 'Course · Self-paced · Certificate',
    pathMeta: 'Research methodology · Self-paced · Certificate',
    cover: whiteboard,
    pathCover: pathResearch,
    coverTint: 'bg-lavender',
    lessons: 8,
    duration: '3h 40m',
    description:
      'Learn how real research works — from turning a topic into a sharp question to choosing a method, collecting data and presenting what you found.',
  },
  {
    id: 'scientific-paper-writing',
    title: 'Scientific Paper Writing',
    area: 'Writing',
    topic: 'writing',
    categories: ['all', 'writing'],
    meta: 'Course · Self-paced · Certificate',
    pathMeta: 'Academic writing · Self-paced · Certificate',
    cover: paperWriting,
    pathCover: pathWriting,
    coverTint: 'bg-peach',
    lessons: 10,
    duration: '4h 15m',
    description:
      'Structure, draft and polish a paper reviewers want to read. Abstracts, introductions, results and discussion — with templates for each section.',
  },
  {
    id: 'journal-publication',
    title: 'Journal Publication: Manuscript to Indexing',
    area: 'Publishing',
    topic: 'journal',
    categories: ['all', 'journal'],
    meta: 'Course · Self-paced · Certificate',
    pathMeta: 'Journal & publishing · Self-paced · Certificate',
    cover: journals,
    coverTint: 'bg-butter',
    lessons: 7,
    duration: '2h 50m',
    description:
      'Pick the right journal, prepare your manuscript, respond to reviewers and understand indexing — the full path from draft to published.',
  },
  {
    id: 'uiux-foundations',
    title: 'UI/UX Design Foundations',
    area: 'Design',
    topic: 'uiux',
    categories: ['all', 'uiux'],
    meta: 'Course · Self-paced · Certificate',
    pathMeta: 'UI/UX design · Self-paced · Certificate',
    cover: designBooks,
    pathCover: pathUx,
    coverTint: 'bg-mint',
    lessons: 9,
    duration: '3h 20m',
    description:
      'Research users, map their problems and design screens that work. Covers interviews, journeys, wireframes, visual design and usability testing.',
  },
  {
    id: 'literature-review',
    title: 'Literature Review & Citations',
    area: 'Research',
    topic: 'literature',
    categories: ['all', 'research', 'writing'],
    meta: 'Course · Self-paced · Certificate',
    pathMeta: 'Literature & review · Self-paced · Certificate',
    cover: '',
    monogram: 'LR',
    coverTint: 'bg-lavender',
    lessons: 6,
    duration: '2h 10m',
    description: 'Find, read and cite sources fast. Build a literature matrix and write a review that shows the gap your work fills.',
  },
  {
    id: 'web-development',
    title: 'Web Development: Build & Ship',
    area: 'Development',
    topic: 'webdev',
    categories: ['all', 'webdev'],
    meta: 'Course · Self-paced · Certificate',
    pathMeta: 'Web & app development · Self-paced · Certificate',
    cover: '',
    monogram: 'WD',
    coverTint: 'bg-butter',
    lessons: 12,
    duration: '6h 05m',
    description: 'HTML, CSS and JavaScript fundamentals, then build and deploy a real project you can show in interviews.',
  },
  {
    id: 'emerging-tech',
    title: 'Emerging Technology for Researchers',
    area: 'Emerging tech',
    topic: 'emerging',
    categories: ['all', 'emerging'],
    meta: 'Course · Self-paced · Certificate',
    pathMeta: 'Emerging technology · Self-paced · Certificate',
    cover: '',
    monogram: 'ET',
    coverTint: 'bg-peach',
    lessons: 6,
    duration: '2h 30m',
    description: 'New tools and methods — AI-assisted research, data tools and reproducible workflows, explained without the hype.',
  },
  {
    id: 'hackathon-playbook',
    title: 'Hackathon Playbook',
    area: 'Events',
    topic: 'hackathons',
    categories: ['all', 'hackathons'],
    meta: 'Course · Self-paced · Certificate',
    pathMeta: 'Hackathons & events · Self-paced · Certificate',
    cover: '',
    monogram: 'HP',
    coverTint: 'bg-mint',
    lessons: 5,
    duration: '1h 45m',
    description: 'Form a team, scope an idea in hours, build a demo and pitch it. Everything you need to compete and get noticed.',
  },
  {
    id: 'global-conference-hub',
    title: 'Global Conference Hub',
    area: 'Conferences',
    topic: 'journal',
    categories: ['all', 'conferences', 'journal'],
    meta: 'Programme · Hybrid · Certificate',
    pathMeta: 'Conferences · Hybrid · Certificate',
    cover: '',
    monogram: 'GC',
    coverTint: 'bg-lavender',
    lessons: 4,
    duration: '1h 30m',
    description: 'Prepare an abstract, poster and talk for international conferences — and present with ECLearnix partner events.',
  },
];

export const courseById = (id: string) => courses.find((c) => c.id === id);

/** Order used when building a starter path from interests */
const topicCourse: Record<TopicId, string> = {
  research: 'research-methodology',
  writing: 'scientific-paper-writing',
  journal: 'journal-publication',
  literature: 'literature-review',
  uiux: 'uiux-foundations',
  webdev: 'web-development',
  hackathons: 'hackathon-playbook',
  emerging: 'emerging-tech',
};

export const topicOrder: TopicId[] = ['research', 'writing', 'journal', 'literature', 'uiux', 'webdev', 'hackathons', 'emerging'];

export function starterPath(interests: TopicId[]): CatalogCourse[] {
  return topicOrder
    .filter((t) => interests.includes(t))
    .map((t) => courseById(topicCourse[t]))
    .filter((c): c is CatalogCourse => Boolean(c));
}

export const categoryChips: { id: CategoryId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'research', label: 'Research' },
  { id: 'writing', label: 'Academic writing' },
  { id: 'journal', label: 'Journal publishing' },
  { id: 'uiux', label: 'UI/UX design' },
  { id: 'webdev', label: 'Web development' },
  { id: 'emerging', label: 'Emerging tech' },
  { id: 'hackathons', label: 'Hackathons' },
  { id: 'conferences', label: 'Conferences' },
];

export const popularCourseIds = ['research-methodology', 'scientific-paper-writing', 'journal-publication', 'uiux-foundations'];
