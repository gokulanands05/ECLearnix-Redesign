import { Check, Maximize, Minimize, Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '../../lib/cn';
import { formatTime } from '../../lib/format';
import { IconButton } from '../ui/Button';
import { handleMenuKeys, Popover } from '../ui/Popover';

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export interface PlayerState {
  time: number;
  playing: boolean;
}

/**
 * Simulated video player — no real media, but every control behaves like the real thing
 * (play/pause, seek, ±10s, speed, captions, mute, fullscreen, keyboard shortcuts).
 */
export function VideoPlayer({
  poster,
  title,
  duration,
  time,
  playing,
  onTime,
  onPlaying,
  caption,
  onEnded,
}: {
  poster: string;
  title: string;
  duration: number;
  time: number;
  playing: boolean;
  onTime: (t: number) => void;
  onPlaying: (p: boolean) => void;
  caption?: string;
  onEnded?: () => void;
}) {
  const [speed, setSpeed] = useState(1);
  const [cc, setCc] = useState(false);
  const [muted, setMuted] = useState(false);
  const [full, setFull] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef<HTMLButtonElement>(null);
  const timeRef = useRef(time);
  useLayoutEffect(() => {
    timeRef.current = time;
  }, [time]);

  // playback clock
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const next = timeRef.current + 0.25 * speed;
      if (next >= duration) {
        onTime(duration);
        onPlaying(false);
        onEnded?.();
      } else onTime(next);
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, speed, duration, onTime, onPlaying, onEnded]);

  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const showFlash = (s: string) => {
    setFlash(s);
    window.setTimeout(() => setFlash(null), 600);
  };
  const seekBy = (d: number) => {
    onTime(Math.min(duration, Math.max(0, time + d)));
    showFlash(d > 0 ? `+${d}s` : `${d}s`);
  };
  const toggle = () => {
    if (!playing && time >= duration) onTime(0);
    onPlaying(!playing);
  };
  const toggleFull = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await wrapRef.current?.requestFullscreen();
    } catch {
      /* fullscreen not allowed (e.g. iframe) */
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' && e.key !== ' ') return;
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') {
      e.preventDefault();
      toggle();
    } else if (k === 'arrowleft' || k === 'j') {
      e.preventDefault();
      seekBy(-10);
    } else if (k === 'arrowright' || k === 'l') {
      e.preventDefault();
      seekBy(10);
    } else if (k === 'm') setMuted((m) => !m);
    else if (k === 'c') setCc((c) => !c);
    else if (k === 'f') toggleFull();
  };

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      tabIndex={-1}
      onKeyDown={onKey}
      className={cn('group/player relative w-full overflow-hidden bg-ink outline-none', full ? 'h-screen' : 'h-[260px] rounded-xl sm:h-[430px]')}
      aria-label={`Video player: ${title}`}
      role="region"
    >
      <button type="button" onClick={toggle} className="absolute inset-0 block size-full cursor-pointer" aria-label={playing ? 'Pause video' : 'Play video'} tabIndex={-1}>
        <img src={poster} alt="" className={cn('size-full object-cover transition-[filter] duration-300', !playing && 'brightness-[0.92]')} />
      </button>

      {/* Big play button when paused */}
      {!playing && (
        <button
          type="button"
          onClick={toggle}
          aria-label={time >= duration ? 'Replay video' : 'Play video'}
          className="absolute top-1/2 left-1/2 grid size-[72px] -translate-x-1/2 -translate-y-[calc(50%+36px)] animate-pop place-items-center rounded-full bg-page shadow-l transition-transform hover:scale-105"
        >
          {time >= duration ? <RotateCcw size={28} className="text-ink" aria-hidden /> : <Play size={28} fill="currentColor" strokeWidth={0} className="ml-1 text-ink" aria-hidden />}
        </button>
      )}

      {flash && (
        <span className="t-label-l pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+36px)] animate-pop rounded-full bg-ink/80 px-4 py-2 text-white">
          {flash}
        </span>
      )}

      {cc && caption && (
        <p className="t-body-m pointer-events-none absolute inset-x-0 bottom-[96px] mx-auto w-fit max-w-[80%] rounded-sm bg-ink/85 px-3 py-1.5 text-center text-white">
          {caption}
        </p>
      )}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-ink px-4 pt-3.5 pb-3">
        <div className="relative h-3.5 w-full">
          <span aria-hidden className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white" />
          <span aria-hidden className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-highlight" style={{ width: `${pct}%` }} />
          <span
            aria-hidden
            className="absolute top-0 size-3.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_0_2px_var(--color-ink)] transition-transform group-hover/player:scale-110"
            style={{ left: `${pct}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration}
            step={1}
            value={Math.floor(time)}
            onChange={(e) => onTime(Number(e.target.value))}
            aria-label="Seek"
            aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
            className="seek absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </div>
        <div className="flex items-center gap-1">
          <IconButton variant="onDark" label={playing ? 'Pause (k)' : 'Play (k)'} onClick={toggle}>
            {playing ? <Pause size={18} fill="currentColor" strokeWidth={0} aria-hidden /> : <Play size={18} fill="currentColor" strokeWidth={0} aria-hidden />}
          </IconButton>
          <IconButton variant="onDark" className="max-sm:hidden" label="Back 10 seconds (j)" onClick={() => seekBy(-10)}>
            <RotateCcw size={18} strokeWidth={2.25} aria-hidden />
          </IconButton>
          <IconButton variant="onDark" className="max-sm:hidden" label="Forward 10 seconds (l)" onClick={() => seekBy(10)}>
            <RotateCw size={18} strokeWidth={2.25} aria-hidden />
          </IconButton>
          <span className="t-label-m ml-1 whitespace-nowrap text-white tabular-nums" aria-live="off">
            {formatTime(time)} / {formatTime(duration)}
          </span>
          <span className="flex-1" />
          <button
            ref={speedRef}
            type="button"
            onClick={() => setSpeedOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={speedOpen}
            aria-label={`Playback speed ${speed}x`}
            className="t-label-m rounded-sm px-2.5 py-2 text-white hover:bg-white/10 aria-expanded:bg-white/15"
          >
            {speed}x
          </button>
          <button
            type="button"
            onClick={() => setCc((c) => !c)}
            aria-pressed={cc}
            aria-label="Captions (c)"
            className={cn('t-label-m rounded-sm px-2.5 py-2 text-white hover:bg-white/10', cc && 'bg-white/15 underline decoration-highlight decoration-2 underline-offset-4')}
          >
            CC
          </button>
          <IconButton variant="onDark" className="max-sm:hidden" label={muted ? 'Unmute (m)' : 'Mute (m)'} aria-pressed={muted} onClick={() => setMuted((m) => !m)}>
            {muted ? <VolumeX size={18} strokeWidth={2.25} aria-hidden /> : <Volume2 size={18} strokeWidth={2.25} aria-hidden />}
          </IconButton>
          <IconButton variant="onDark" label={full ? 'Exit full screen (f)' : 'Full screen (f)'} onClick={toggleFull}>
            {full ? <Minimize size={18} strokeWidth={2.25} aria-hidden /> : <Maximize size={18} strokeWidth={2.25} aria-hidden />}
          </IconButton>
        </div>
      </div>

      <Popover open={speedOpen} onClose={() => setSpeedOpen(false)} anchorRef={speedRef} placement="top-end" role="menu" label="Playback speed" className="w-[160px] border-ink-raised bg-ink-raised p-1.5">
        <div onKeyDown={handleMenuKeys}>
          <p className="t-overline px-2.5 pt-1.5 pb-1 text-on-dark-muted">Speed</p>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              role="menuitemradio"
              aria-checked={speed === s}
              onClick={() => {
                setSpeed(s);
                setSpeedOpen(false);
                showFlash(`${s}x`);
              }}
              className="t-label-m flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-white hover:bg-white/10 focus:bg-white/10 focus:outline-none"
            >
              {s === 1 ? 'Normal' : `${s}x`}
              {speed === s && <Check size={16} className="text-highlight" aria-hidden />}
            </button>
          ))}
        </div>
      </Popover>
    </div>
  );
}
