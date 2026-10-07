import { ArrowRight, Check, CircleCheck, CircleX, RotateCcw, Trophy } from 'lucide-react';
import { useState } from 'react';
import type { QuizQuestion } from '../data/types';
import { cn } from '../lib/cn';
import { Button } from './ui/Button';

const PASS = 0.6;

/** One-question-at-a-time quiz with instant feedback and a result screen. */
export function Quiz({
  questions,
  onFinish,
  onContinue,
  continueLabel = 'Continue',
}: {
  questions: QuizQuestion[];
  onFinish: (score: number, passed: boolean) => void;
  onContinue?: () => void;
  continueLabel?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[idx];
  const correct = picked === q?.answer;

  const check = () => {
    if (picked === null) return;
    setChecked(true);
    if (picked === q.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx === questions.length - 1) {
      const passed = score / questions.length >= PASS;
      setDone(true);
      onFinish(score, passed);
      return;
    }
    setIdx((i) => i + 1);
    setPicked(null);
    setChecked(false);
  };

  const restart = () => {
    setIdx(0);
    setPicked(null);
    setChecked(false);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const passed = score / questions.length >= PASS;
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center" role="status">
        <span className={cn('grid size-16 place-items-center rounded-full', passed ? 'bg-highlight' : 'bg-peach')}>
          {passed ? <Trophy size={28} className="text-ink" aria-hidden /> : <RotateCcw size={26} className="text-streak" aria-hidden />}
        </span>
        <p className="t-heading-m text-ink">
          {score} / {questions.length} correct
        </p>
        <p className="t-body-m max-w-[380px] text-body">
          {passed ? 'Nice work — you’ve got the three checks down. This quiz is marked complete.' : `You need ${Math.ceil(questions.length * PASS)} correct to pass. Review the lesson and try again.`}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Button variant="secondary" onClick={restart} leading={<RotateCcw size={16} aria-hidden />}>
            Retake quiz
          </Button>
          {passed && onContinue && (
            <Button onClick={onContinue} trailing={<ArrowRight size={16} aria-hidden />}>
              {continueLabel}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="t-label-m text-body">
          Question {idx + 1} of {questions.length}
        </span>
        <div className="flex flex-1 gap-1" aria-hidden>
          {questions.map((_, i) => (
            <span key={i} className={cn('h-1.5 flex-1 rounded-full', i < idx ? 'bg-brand' : i === idx ? 'bg-brand/50' : 'bg-line')} />
          ))}
        </div>
      </div>
      <fieldset>
        <legend className="t-heading-s mb-4 text-ink">{q.prompt}</legend>
        <div className="flex flex-col gap-2" role="radiogroup">
          {q.options.map((opt, i) => {
            const isPicked = picked === i;
            const isAnswer = q.answer === i;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={isPicked}
                disabled={checked}
                onClick={() => setPicked(i)}
                className={cn(
                  't-body-m flex items-center gap-3 rounded-md border-2 px-4 py-3 text-left transition-colors disabled:cursor-default',
                  !checked && (isPicked ? 'border-brand bg-brand-tint' : 'border-line hover:border-line-strong hover:bg-subtle'),
                  checked && isAnswer && 'border-success bg-success-bg',
                  checked && isPicked && !isAnswer && 'border-danger bg-danger-bg',
                  checked && !isPicked && !isAnswer && 'border-line opacity-60',
                )}
              >
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border-2',
                    isPicked && !checked ? 'border-brand bg-brand' : 'border-line-strong bg-page',
                    checked && isAnswer && 'border-success bg-success',
                    checked && isPicked && !isAnswer && 'border-danger bg-danger',
                  )}
                  aria-hidden
                >
                  {((isPicked && !checked) || (checked && isAnswer)) && <Check size={11} strokeWidth={3.5} className="text-white" />}
                </span>
                <span className="text-ink">{opt}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {checked && (
        <div className={cn('flex gap-3 rounded-md p-4', correct ? 'bg-success-bg' : 'bg-danger-bg')} role="alert">
          {correct ? <CircleCheck size={20} className="shrink-0 text-success" aria-hidden /> : <CircleX size={20} className="shrink-0 text-danger" aria-hidden />}
          <div>
            <p className={cn('t-label-m', correct ? 'text-success' : 'text-danger')}>{correct ? 'Correct!' : 'Not quite.'}</p>
            <p className="t-body-s mt-0.5 text-ink">{q.why}</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        {checked ? (
          <Button onClick={next} trailing={<ArrowRight size={16} aria-hidden />}>
            {idx === questions.length - 1 ? 'See results' : 'Next question'}
          </Button>
        ) : (
          <Button onClick={check} disabled={picked === null}>
            Check answer
          </Button>
        )}
      </div>
    </div>
  );
}
