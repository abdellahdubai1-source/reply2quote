import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared field chrome: label, hint, and accessible error message,
 *  wired via aria-describedby so screen readers announce errors. */
interface FieldWrapperProps {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldWrapper({ id, label, hint, error, required, children, className }: FieldWrapperProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
          {required && <span className="text-brand-700"> *</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const baseFieldClasses =
  "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-faint " +
  "transition-shadow focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 " +
  "disabled:bg-neutral-50 disabled:text-neutral-400";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, hint, error, required, className, ...props }, ref) => {
    return (
      <FieldWrapper id={id!} label={label} hint={hint} error={error} required={required}>
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(baseFieldClasses, error && "border-red-400 focus:ring-red-500 focus:border-red-500", className)}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ id, label, hint, error, required, className, ...props }, ref) => {
    return (
      <FieldWrapper id={id!} label={label} hint={hint} error={error} required={required}>
        <textarea
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(baseFieldClasses, "resize-y leading-relaxed", error && "border-red-400 focus:ring-red-500 focus:border-red-500", className)}
          {...props}
        />
      </FieldWrapper>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ id, label, hint, error, required, className, children, ...props }, ref) => {
    return (
      <FieldWrapper id={id!} label={label} hint={hint} error={error} required={required}>
        <select
          ref={ref}
          id={id}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(baseFieldClasses, "pr-8", error && "border-red-400 focus:ring-red-500 focus:border-red-500", className)}
          {...props}
        >
          {children}
        </select>
      </FieldWrapper>
    );
  }
);
Select.displayName = "Select";
