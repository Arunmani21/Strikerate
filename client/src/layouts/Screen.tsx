import type { ReactNode } from "react";
import { AppBar } from "../components/ui/AppBar";

interface ScreenProps {
  title: ReactNode;
  backTo?: string;
  onBack?: () => void;
  right?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}

export function Screen({ title, backTo, onBack, right, children, padded = true }: ScreenProps) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar title={title} backTo={backTo} onBack={onBack} right={right} />
      <main className={padded ? "flex-1 space-y-4 px-4 py-4" : "flex-1"}>{children}</main>
    </div>
  );
}
