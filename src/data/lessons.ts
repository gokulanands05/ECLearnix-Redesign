import type { Module, QuizQuestion, TranscriptLine } from './types';

export const COURSE_ID = 'research-methodology';

/** Course outline exactly as in the Lesson screen side nav. */
export const modules: Module[] = [
  {
    id: 'm1',
    number: 1,
    title: 'Foundations',
    lessons: [
      { id: 'what-makes-research-original', title: 'What makes research original', kind: 'Reading', minutes: 12 },
      { id: 'types-of-research', title: 'Types of research', kind: 'Video', minutes: 8, duration: 480 },
      { id: 'research-ethics-basics', title: 'Research ethics basics', kind: 'Reading', minutes: 6 },
    ],
  },
  {
    id: 'm2',
    number: 2,
    title: 'Asking the right question',
    lessons: [
      { id: 'researchable-question', title: 'What makes a question researchable', kind: 'Reading', minutes: 6 },
      { id: 'reviewing-literature', title: 'Reviewing literature quickly', kind: 'Reading', minutes: 6 },
      { id: 'framing-research-question', title: 'Framing a strong research question', kind: 'Video', minutes: 9, duration: 570 },
      { id: 'check-understanding', title: 'Check your understanding', kind: 'Quiz', minutes: 4, questions: 5 },
      { id: 'question-templates', title: 'Templates for research questions', kind: 'Reading', minutes: 4 },
    ],
  },
  {
    id: 'm3',
    number: 3,
    title: 'Choosing a method',
    lessons: [
      { id: 'qual-vs-quant', title: 'Qualitative vs quantitative', kind: 'Video', minutes: 11, duration: 660 },
      { id: 'sampling', title: 'Sampling without bias', kind: 'Reading', minutes: 7 },
      { id: 'mixed-methods', title: 'When to mix methods', kind: 'Video', minutes: 8, duration: 480 },
      { id: 'method-quiz', title: 'Pick the method', kind: 'Quiz', minutes: 5, questions: 6 },
    ],
  },
  {
    id: 'm4',
    number: 4,
    title: 'Collecting data',
    lessons: [
      { id: 'surveys', title: 'Designing a survey', kind: 'Video', minutes: 12, duration: 720 },
      { id: 'interviews', title: 'Running interviews', kind: 'Video', minutes: 10, duration: 600 },
      { id: 'data-hygiene', title: 'Keeping data clean', kind: 'Reading', minutes: 6 },
      { id: 'data-quiz', title: 'Data check', kind: 'Quiz', minutes: 4, questions: 5 },
    ],
  },
  {
    id: 'm5',
    number: 5,
    title: 'Final project',
    lessons: [
      { id: 'project-brief', title: 'Project brief', kind: 'Reading', minutes: 5 },
      { id: 'submit-project', title: 'Submit your research question', kind: 'Reading', minutes: 15 },
    ],
  },
];

export const allLessons = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, moduleId: m.id, moduleNumber: m.number })));

/** Lessons that count towards "Complete course · x of 8 lessons" (Modules 1–2). */
export const CORE_LESSON_IDS = modules.slice(0, 2).flatMap((m) => m.lessons.map((l) => l.id));

export const initialCompleted = ['what-makes-research-original', 'types-of-research', 'research-ethics-basics', 'researchable-question', 'reviewing-literature'];

export const CURRENT_LESSON_ID = 'framing-research-question';

export const transcripts: Record<string, TranscriptLine[]> = {
  'framing-research-question': [
    { at: 0, text: 'Welcome back. In this lesson we turn a broad interest into a question you can actually answer.' },
    { at: 34, text: 'Start by writing down the topic that pulled you in — keep it messy for now.' },
    { at: 71, text: 'Then ask yourself who is affected, where it happens and over what period of time.' },
    { at: 118, text: 'Those three details — group, place and time — are the levers we will use throughout.' },
    { at: 162, text: 'Let us look at a real example from a second-year student project.' },
    { at: 198, text: 'Most first drafts of a research question are really a topic, not a question.' },
    { at: 220, text: 'A topic tells you where to look. A question tells you what you are trying to find out.' },
    { at: 242, text: 'So the first test is simple: can someone else read it and know what an answer would look like?' },
    { at: 252, text: 'If the answer could be anything, the question is still too broad. Narrow the group, the place or the time frame.' },
    { at: 278, text: 'Next, check that you can actually collect the data you need within a semester.' },
    { at: 305, text: 'Finally, ask whether the answer would matter to anyone beyond you. That is what makes it worth asking.' },
    { at: 342, text: 'Put together, these give you three quick checks: clear, doable and worth it.' },
    { at: 381, text: 'Try rewriting the example question using all three checks before you continue.' },
    { at: 436, text: 'Notice how the narrowed version already hints at the method you might use.' },
    { at: 489, text: 'In the next lesson you will test your understanding with a short quiz.' },
    { at: 532, text: 'Then we will share templates you can adapt for your own project. See you there.' },
  ],
};

export const quiz: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: 'Which of these is a research question rather than a topic?',
    options: [
      'Social media and students',
      'How does daily Instagram use affect sleep among first-year engineering students in Chennai?',
      'The impact of technology',
      'Student mental health',
    ],
    answer: 1,
    why: 'It names a group, a place and something specific to find out — someone can picture what an answer looks like.',
  },
  {
    id: 'q2',
    prompt: 'Your question could have almost any answer. What should you do first?',
    options: ['Collect more data', 'Narrow the group, place or time frame', 'Add more variables', 'Change your topic completely'],
    answer: 1,
    why: 'A question that allows any answer is still too broad. Narrowing one of the three levers makes it answerable.',
  },
  {
    id: 'q3',
    prompt: 'What does the “doable” check ask?',
    options: [
      'Whether your guide likes the question',
      'Whether you can collect the data you need within the time you have',
      'Whether the question has been asked before',
      'Whether it fits in one sentence',
    ],
    answer: 1,
    why: 'Doable means you can realistically gather the data within your semester or project window.',
  },
  {
    id: 'q4',
    prompt: 'Which detail is NOT one of the three levers for narrowing a question?',
    options: ['Group', 'Place', 'Time frame', 'Word count'],
    answer: 3,
    why: 'Group, place and time frame are the levers. Word count does not change what you are trying to find out.',
  },
  {
    id: 'q5',
    prompt: 'What makes a question “worth asking”?',
    options: ['It is hard to answer', 'It uses technical words', 'The answer matters to someone beyond you', 'It needs a big sample'],
    answer: 2,
    why: 'A question is worth asking when its answer would be useful to others — a community, a field or decision makers.',
  },
];

export const resources = [
  { id: 'r1', title: 'Lesson slides — Framing a strong research question', type: 'PDF', size: '2.4 MB' },
  { id: 'r2', title: 'Research question worksheet', type: 'DOCX', size: '84 KB' },
  { id: 'r3', title: 'Three checks: clear, doable, worth it — cheat sheet', type: 'PDF', size: '310 KB' },
  { id: 'r4', title: 'Further reading: Booth et al., The Craft of Research (ch. 3)', type: 'Link', size: 'External' },
];

export interface Post {
  id: string;
  author: string;
  initials: string;
  tint: string;
  college: string;
  time: string;
  body: string;
  likes: number;
  replies: number;
}

export const discussion: Post[] = [
  {
    id: 'p1',
    author: 'Priya Raman',
    initials: 'PR',
    tint: 'bg-lavender',
    college: 'PSG College of Technology',
    time: '2h ago',
    body: 'My first draft was “AI in healthcare” 😅. After this lesson: “How do nurses in Coimbatore district hospitals use AI triage tools during night shifts?” Much clearer.',
    likes: 24,
    replies: 3,
  },
  {
    id: 'p2',
    author: 'Arjun Mehta',
    initials: 'AM',
    tint: 'bg-mint',
    college: 'VIT Vellore',
    time: 'Yesterday',
    body: 'Is a semester really enough for interview-based data? Planning 15 interviews — would love to hear what others did.',
    likes: 11,
    replies: 6,
  },
];
