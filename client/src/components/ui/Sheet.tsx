import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 animate-[fade-in_150ms_ease-out] bg-[rgba(4,8,18,0.72)]"
        onClick={onClose}
      />
      <div className="relative mt-auto w-full max-w-[480px] animate-[sheet-in_220ms_cubic-bezier(0.32,0.72,0,1)] rounded-t-lg border-t border-line bg-surface">
        <div className="flex justify-center pt-2.5">
          <div className="h-1 w-10 rounded-full bg-line" />
        </div>
        {title && (
          <h2 className="px-4 pt-2 font-display text-base font-bold uppercase tracking-wide">
            {title}
          </h2>
        )}
        <div
          className="px-4 pt-3"
          style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
