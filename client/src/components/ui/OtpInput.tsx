import { useEffect, useRef } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { cn } from "../../lib/cn";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const focusAt = (i: number) =>
    refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const chars = Array.from({ length }, (_, k) => value[k] ?? "");
    chars[i] = digit;
    onChange(chars.join(""));
    if (i < length - 1) focusAt(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    const chars = Array.from({ length }, (_, k) => value[k] ?? "");
    if (e.key === "Backspace") {
      e.preventDefault();
      if (chars[i]) {
        chars[i] = "";
        onChange(chars.join(""));
      } else if (i > 0) {
        chars[i - 1] = "";
        onChange(chars.join(""));
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight" && i < length - 1) {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (digits) onChange(digits);
  };

  return (
    <div className="flex gap-2">
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            "h-12 w-full rounded-md border bg-elevated text-center font-display text-xl font-bold text-text outline-none transition-colors focus:border-accent disabled:opacity-50",
            value[i] ? "border-accent/60" : "border-line",
          )}
        />
      ))}
    </div>
  );
}
