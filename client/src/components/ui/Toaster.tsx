import { createPortal } from "react-dom";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useToastStore, type ToastType } from "../../stores/toast.store";

const icons: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const iconColors: Record<ToastType, string> = {
  success: "text-accent",
  error: "text-wicket",
  info: "text-info",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] mx-auto flex max-w-[480px] flex-col gap-2 px-4"
      style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}
    >
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <button
            key={t.id}
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto flex animate-[toast-in_180ms_ease-out] items-start gap-2.5 rounded-md border border-line bg-elevated px-3 py-2.5 text-left shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          >
            <Icon className={`mt-0.5 size-4 shrink-0 ${iconColors[t.type]}`} />
            <span className="text-sm leading-snug text-text">{t.message}</span>
          </button>
        );
      })}
    </div>,
    document.body,
  );
}
