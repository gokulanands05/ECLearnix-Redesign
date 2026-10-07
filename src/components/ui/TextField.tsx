import { CircleAlert, Eye, EyeOff } from 'lucide-react';
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  htmlFor: string;
  errorId: string;
  hintId: string;
  children: ReactNode;
  optional?: boolean;
}

function FieldShell({ label, error, hint, htmlFor, errorId, hintId, children, optional }: FieldShellProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={htmlFor} className="t-label-m text-ink">
        {label}
        {optional && <span className="t-label-s ml-1 text-muted">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="t-label-s flex items-center gap-1.5 text-danger" role="alert">
          <CircleAlert size={14} strokeWidth={2.25} aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="t-label-s text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const fieldBox = (error?: string, disabled?: boolean) =>
  cn(
    'flex w-full items-center gap-2 rounded-md border-[1.5px] bg-page px-4 transition-[border-color,box-shadow] duration-150',
    'focus-within:border-brand focus-within:shadow-[0_0_0_4px_var(--color-brand-tint)]',
    error ? 'border-danger focus-within:border-danger focus-within:shadow-[0_0_0_4px_var(--color-danger-bg)]' : 'border-line-strong hover:border-[#cfcae4]',
    disabled && 'bg-subtle hover:border-line-strong',
  );

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, optional, id, type = 'text', disabled, className, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={inputId} errorId={errorId} hintId={hintId} optional={optional}>
      <div className={cn(fieldBox(error, disabled), 'h-[50px]', className)}>
        <input
          ref={ref}
          id={inputId}
          type={isPassword && reveal ? 'text' : type}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            't-body-m min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted disabled:text-muted',
            isPassword && !reveal && '[&:not(:placeholder-shown)]:tracking-[0.12em]',
          )}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
            className="-mr-2 grid size-9 place-items-center rounded-sm text-body hover:bg-field hover:text-ink"
          >
            {reveal ? <EyeOff size={20} strokeWidth={2} aria-hidden /> : <Eye size={20} strokeWidth={2} aria-hidden />}
          </button>
        )}
      </div>
    </FieldShell>
  );
});

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, hint, optional, id, disabled, rows = 4, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={inputId} errorId={errorId} hintId={hintId} optional={optional}>
      <div className={cn(fieldBox(error, disabled), 'py-3')}>
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className="t-body-m w-full resize-none bg-transparent text-ink outline-none placeholder:text-muted"
          {...rest}
        />
      </div>
    </FieldShell>
  );
});
