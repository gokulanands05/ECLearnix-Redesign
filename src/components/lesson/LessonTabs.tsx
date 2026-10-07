import { Check, Download, ExternalLink, FileText, Heart, Link2, MessageCircle, NotebookPen, Trash2 } from 'lucide-react';
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { discussion as seedPosts, resources, type Post } from '../../data/lessons';
import type { TranscriptLine } from '../../data/types';
import { cn } from '../../lib/cn';
import { formatTime, initials } from '../../lib/format';
import { useApp, type Note } from '../../store/AppStore';
import { Button } from '../ui/Button';
import { Avatar, EmptyState } from '../ui/primitives';
import { useToast } from '../ui/Toast';

const TABS = ['Transcript', 'Notes', 'Resources', 'Discussion'] as const;
export type TabName = (typeof TABS)[number];

export function LessonTabs({
  lessonId,
  transcript,
  time,
  activeIndex,
  onSeek,
  tab,
  onTab,
  hasVideo,
}: {
  lessonId: string;
  transcript: TranscriptLine[];
  time: number;
  activeIndex: number;
  onSeek: (t: number) => void;
  tab: TabName;
  onTab: (t: TabName) => void;
  hasVideo: boolean;
}) {
  const app = useApp();
  const notes = app.notes.filter((n) => n.lessonId === lessonId);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent) => {
    const i = TABS.indexOf(tab);
    let n = i;
    if (e.key === 'ArrowRight') n = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = TABS.length - 1;
    else return;
    e.preventDefault();
    onTab(TABS[n]);
    tabRefs.current[n]?.focus();
  };

  return (
    <div className="flex flex-col gap-5">
      <div role="tablist" aria-label="Lesson content" onKeyDown={onKey} className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t, i) => {
          const selected = tab === t;
          const count = t === 'Notes' ? notes.length : 0;
          return (
            <button
              key={t}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${t}`}
              aria-selected={selected}
              aria-controls={`panel-${t}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onTab(t)}
              className={cn(
                't-label-l -mb-px flex h-[46px] shrink-0 items-center gap-2 border-b-[3px] px-4 transition-colors',
                selected ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-body',
              )}
            >
              {t}
              {count > 0 && <span className="t-label-s grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-white">{count}</span>}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0} className="outline-none">
        {tab === 'Transcript' &&
          (hasVideo && transcript.length ? (
            <TranscriptPanel lessonId={lessonId} lines={transcript} activeIndex={activeIndex} onSeek={onSeek} onViewNotes={() => onTab('Notes')} />
          ) : (
            <EmptyState icon={<FileText size={24} aria-hidden />} title="No transcript for this lesson" body="Transcripts are available for video lessons. This one is a reading — everything is on the page above." />
          ))}
        {tab === 'Notes' && <NotesPanel lessonId={lessonId} notes={notes} time={time} hasVideo={hasVideo} onSeek={onSeek} />}
        {tab === 'Resources' && <ResourcesPanel />}
        {tab === 'Discussion' && <DiscussionPanel />}
      </div>
    </div>
  );
}

/* ---------------- Transcript ---------------- */
function TranscriptPanel({
  lessonId,
  lines,
  activeIndex,
  onSeek,
  onViewNotes,
}: {
  lessonId: string;
  lines: TranscriptLine[];
  activeIndex: number;
  onSeek: (t: number) => void;
  onViewNotes: () => void;
}) {
  const app = useApp();
  const toast = useToast();
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // keep the active line as the 4th visible line (matches the Figma layout)
  useLayoutEffect(() => {
    const list = listRef.current;
    const anchor = rowRefs.current[Math.max(0, activeIndex - 3)];
    if (!list || !anchor) return;
    list.scrollTo({ top: anchor.offsetTop, behavior: 'smooth' });
  }, [activeIndex]);

  const savedAt = new Set(app.notes.filter((n) => n.lessonId === lessonId).map((n) => n.at));

  return (
    <div ref={listRef} className="relative flex max-h-[308px] max-w-[780px] flex-col gap-1 overflow-y-auto scroll-smooth pr-1" aria-label="Transcript">
      {lines.map((l, i) => {
        const state = i < activeIndex ? 'past' : i === activeIndex ? 'current' : 'future';
        const saved = savedAt.has(l.at);
        return (
          <div
            key={l.at}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            className={cn(
              'group/line flex shrink-0 items-start gap-4 rounded-sm px-2.5 py-2 transition-colors',
              state === 'current' ? 'bg-highlight' : 'hover:bg-subtle',
            )}
          >
            <button
              type="button"
              onClick={() => onSeek(l.at)}
              className="flex min-w-0 flex-1 items-start gap-4 text-left"
              aria-current={state === 'current' ? 'true' : undefined}
              aria-label={`Jump to ${formatTime(l.at)}: ${l.text}`}
            >
              <span className={cn('t-label-m w-10 shrink-0 tabular-nums', state === 'current' ? 'text-ink' : 'text-muted')}>{formatTime(l.at)}</span>
              <span className={cn('t-body-m flex-1', state === 'future' ? 'text-muted' : 'text-ink')}>{l.text}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (saved) {
                  onViewNotes();
                  return;
                }
                app.addNote({ lessonId, at: l.at, text: l.text });
                toast.show(`Saved note at ${formatTime(l.at)}`, { action: { label: 'View notes', onClick: onViewNotes } });
              }}
              className={cn(
                't-label-s shrink-0 items-center gap-1 rounded-full px-2.5 py-[5px] transition-opacity',
                saved ? 'flex bg-page text-success' : 'bg-ink text-white hover:bg-ink-raised',
                state === 'current' || saved ? 'flex' : 'hidden group-focus-within/line:flex group-hover/line:flex',
              )}
            >
              {saved && <Check size={13} strokeWidth={3} aria-hidden />}
              {saved ? 'Saved' : 'Save note'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Notes ---------------- */
function NotesPanel({ lessonId, notes, time, hasVideo, onSeek }: { lessonId: string; notes: Note[]; time: number; hasVideo: boolean; onSeek: (t: number) => void }) {
  const app = useApp();
  const toast = useToast();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const at = Math.floor(time);

  const save = () => {
    if (text.trim().length < 3) {
      setError('Write at least a few words');
      return;
    }
    app.addNote({ lessonId, at: hasVideo ? at : 0, text: text.trim() });
    setText('');
    setError(null);
    toast.show('Note saved');
  };

  const remove = (n: Note) => {
    app.removeNote(n.id);
    toast.show('Note deleted', { tone: 'info', action: { label: 'Undo', onClick: () => app.addNote({ lessonId: n.lessonId, at: n.at, text: n.text }) } });
  };

  return (
    <div className="flex max-w-[780px] flex-col gap-4">
      <div className={cn('rounded-md border-[1.5px] bg-page p-3 transition-colors focus-within:border-brand', error ? 'border-danger' : 'border-line-strong')}>
        <label htmlFor="note-input" className="t-label-s mb-1 block text-muted">
          {hasVideo ? `New note at ${formatTime(at)}` : 'New note'}
        </label>
        <textarea
          id="note-input"
          rows={2}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
          }}
          placeholder="What do you want to remember?"
          className="t-body-m w-full resize-none bg-transparent text-ink outline-none placeholder:text-muted"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'note-error' : undefined}
        />
        <div className="flex items-center justify-between gap-3">
          {error ? (
            <p id="note-error" className="t-label-s text-danger" role="alert">
              {error}
            </p>
          ) : (
            <p className="t-label-s text-muted">Ctrl + Enter to save</p>
          )}
          <Button onClick={save} disabled={!text.trim()}>
            Save note
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<NotebookPen size={24} aria-hidden />}
          title="No notes yet"
          body="Write one above, or hover a transcript line and press “Save note” to keep it here with its timestamp."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {[...notes]
            .sort((a, b) => a.at - b.at)
            .map((n) => (
              <li key={n.id} className="group/note flex items-start gap-3 rounded-md border border-line bg-page p-3.5">
                {hasVideo ? (
                  <button
                    type="button"
                    onClick={() => onSeek(n.at)}
                    className="t-label-m shrink-0 rounded-full bg-highlight px-2.5 py-1 text-ink tabular-nums hover:bg-highlight-hover"
                    aria-label={`Jump to ${formatTime(n.at)}`}
                  >
                    {formatTime(n.at)}
                  </button>
                ) : (
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-lavender text-brand">
                    <NotebookPen size={14} aria-hidden />
                  </span>
                )}
                <p className="t-body-m flex-1 text-ink">{n.text}</p>
                <button
                  type="button"
                  onClick={() => remove(n)}
                  aria-label="Delete note"
                  className="grid size-8 shrink-0 place-items-center rounded-sm text-muted opacity-100 hover:bg-danger-bg hover:text-danger sm:opacity-0 sm:group-focus-within/note:opacity-100 sm:group-hover/note:opacity-100"
                >
                  <Trash2 size={16} aria-hidden />
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Resources ---------------- */
function ResourcesPanel() {
  const toast = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  return (
    <ul className="flex max-w-[780px] flex-col gap-2">
      {resources.map((r) => {
        const isLink = r.type === 'Link';
        const isDone = done.includes(r.id);
        return (
          <li key={r.id} className="flex items-center gap-3 rounded-md border border-line bg-page p-3.5">
            <span className={cn('grid size-10 shrink-0 place-items-center rounded-sm', isLink ? 'bg-mint text-success' : 'bg-lavender text-brand')}>
              {isLink ? <Link2 size={18} aria-hidden /> : <FileText size={18} aria-hidden />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="t-label-m text-ink">{r.title}</p>
              <p className="t-label-s text-muted">
                {r.type} · {r.size}
              </p>
            </div>
            {isLink ? (
              <Button variant="secondary" href="https://press.uchicago.edu/ucp/books/book/chicago/C/bo23521678.html" target="_blank" rel="noreferrer" trailing={<ExternalLink size={15} aria-hidden />}>
                Open
              </Button>
            ) : (
              <Button
                variant="secondary"
                loading={downloading === r.id}
                leading={isDone ? <Check size={16} strokeWidth={2.5} className="text-success" aria-hidden /> : <Download size={16} aria-hidden />}
                onClick={() => {
                  setDownloading(r.id);
                  window.setTimeout(() => {
                    setDownloading(null);
                    setDone((d) => [...d, r.id]);
                    toast.show(`Downloaded ${r.title.split(' — ')[0]}`);
                  }, 800);
                }}
                aria-label={`Download ${r.title}`}
              >
                {isDone ? 'Downloaded' : 'Download'}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------- Discussion ---------------- */
function DiscussionPanel() {
  const app = useApp();
  const toast = useToast();
  const [posts, setPosts] = useState<(Post & { liked?: boolean })[]>(seedPosts);
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);
  const [posting, setPosting] = useState(false);
  const tooShort = text.trim().length < 10;

  const post = () => {
    setTouched(true);
    if (tooShort) return;
    setPosting(true);
    window.setTimeout(() => {
      setPosts((p) => [
        {
          id: crypto.randomUUID(),
          author: app.user?.name ?? 'You',
          initials: initials(app.user?.name, app.user?.email),
          tint: 'bg-peach',
          college: 'You',
          time: 'Just now',
          body: text.trim(),
          likes: 0,
          replies: 0,
        },
        ...p,
      ]);
      setText('');
      setTouched(false);
      setPosting(false);
      toast.show('Posted to the discussion');
    }, 600);
  };

  return (
    <div className="flex max-w-[780px] flex-col gap-4">
      <div className="flex gap-3">
        <Avatar initials={initials(app.user?.name, app.user?.email)} className="border-0" />
        <div className="flex-1">
          <label htmlFor="post-input" className="sr-only">
            Ask a question or share an insight
          </label>
          <div className={cn('rounded-md border-[1.5px] bg-page p-3 focus-within:border-brand', touched && tooShort ? 'border-danger' : 'border-line-strong')}>
            <textarea
              id="post-input"
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask a question or share how you framed yours…"
              className="t-body-m w-full resize-none bg-transparent text-ink outline-none placeholder:text-muted"
              aria-invalid={touched && tooShort ? true : undefined}
            />
            <div className="flex items-center justify-between gap-3">
              <p className={cn('t-label-s', touched && tooShort ? 'text-danger' : 'text-muted')} role={touched && tooShort ? 'alert' : undefined}>
                {touched && tooShort ? 'Posts need at least 10 characters' : 'Be kind — everyone is learning.'}
              </p>
              <Button onClick={post} loading={posting} disabled={!text.trim()}>
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {posts.map((p) => (
          <li key={p.id} className="flex animate-fade gap-3 rounded-md border border-line bg-page p-4">
            <Avatar initials={p.initials} tint={p.tint} className="border-0" />
            <div className="min-w-0 flex-1">
              <p className="t-label-m text-ink">
                {p.author} <span className="t-label-s font-semibold text-muted">· {p.college} · {p.time}</span>
              </p>
              <p className="t-body-m mt-1 text-ink">{p.body}</p>
              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  aria-pressed={Boolean(p.liked)}
                  onClick={() => setPosts((all) => all.map((x) => (x.id === p.id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x)))}
                  className={cn('t-label-s flex items-center gap-1.5 rounded-sm px-2 py-1 hover:bg-subtle', p.liked ? 'text-coral' : 'text-body')}
                >
                  <Heart size={15} fill={p.liked ? 'currentColor' : 'none'} aria-hidden /> {p.likes}
                  <span className="sr-only">likes</span>
                </button>
                <span className="t-label-s flex items-center gap-1.5 px-2 py-1 text-body">
                  <MessageCircle size={15} aria-hidden /> {p.replies} <span className="sr-only">replies</span>
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
