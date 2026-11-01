import { createPortal } from "react-dom";
import { TriangleAlert } from "lucide-react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[55] flex items-center justify-center p-6"
      role="alertdialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 animate-[fade-in_150ms_ease-out] bg-[rgba(4,8,18,0.72)]"
        onClick={loading ? undefined : onClose}
      />
      <div className="relative w-full max-w-[340px] animate-[fade-in_150ms_ease-out] rounded-lg border border-line bg-surface p-4">
        {danger && (
          <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-wicket-soft text-wicket">
            <TriangleAlert className="size-5" />
          </div>
        )}
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {message && (
          <p className="mt-1 text-sm leading-relaxed text-text-dim">{message}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
