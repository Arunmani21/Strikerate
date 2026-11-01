import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-md border border-line bg-elevated px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-faint focus:border-accent disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
