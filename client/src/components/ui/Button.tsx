import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-on-accent active:bg-accent-strong",
  secondary: "border border-line bg-elevated text-text active:bg-line",
  ghost: "text-text-dim active:bg-elevated",
  danger: "bg-wicket text-white active:opacity-90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 rounded-sm px-3 text-sm",
  md: "h-11 rounded-md px-4 text-sm",
  lg: "h-12 rounded-md px-5 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex select-none items-center justify-center gap-2 font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
