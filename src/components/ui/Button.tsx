import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 shadow-soft disabled:bg-brand-700/50",
  secondary: "bg-ink text-white hover:bg-neutral-800 shadow-soft disabled:bg-neutral-400",
  outline: "border border-border bg-white text-ink hover:bg-neutral-50 disabled:text-neutral-400",
  ghost: "text-ink hover:bg-neutral-100 disabled:text-neutral-400",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

/** Shared class builder so non-<button> elements (e.g. Next <Link>)
 *  can look exactly like a Button via `buttonClasses(...)`. */
export function buttonClasses(opts?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  const { variant = "primary", size = "md", fullWidth, className, disabled } = opts ?? {};
  return cn(
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2",
    disabled && "pointer-events-none cursor-not-allowed opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, fullWidth, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={buttonClasses({ variant, size, fullWidth, className })}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
