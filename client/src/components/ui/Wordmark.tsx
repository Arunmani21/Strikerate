import { cn } from "../../lib/cn";

export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/brand/mark.png"
        alt=""
        className={cn(
          "rounded-md",
          size === "lg" ? "size-11" : "size-8",
        )}
      />
      <span
        className={cn(
          "font-display font-bold uppercase tracking-[0.18em]",
          size === "lg" ? "text-3xl" : "text-lg",
        )}
      >
        Strikerate
      </span>
    </div>
  );
}
