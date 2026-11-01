import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-md border border-line bg-elevated px-3 text-sm text-text outline-none transition-colors placeholder:text-text-faint focus:border-accent disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
