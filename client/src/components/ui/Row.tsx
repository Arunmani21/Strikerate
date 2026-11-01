import type { ReactNode } from "react";

interface RowProps {
  label: string;
  value?: ReactNode;
  onClick?: () => void;
}

export function Row({ label, value, onClick }: RowProps) {
  const content = (
    <>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {value != null && <span className="text-sm text-text-dim">{value}</span>}
    </>
  );

  if (!onClick) {
    return <div className="flex items-center gap-3 px-4 py-3.5">{content}</div>;
  }

  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-elevated">
      {content}
    </button>
  );
}
