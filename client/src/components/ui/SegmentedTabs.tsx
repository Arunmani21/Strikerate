import { cn } from "../../lib/cn";

interface SegmentedTabsProps<T extends string> {
  items: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: SegmentedTabsProps<T>) {
  return (
    <div
      className={cn("flex rounded-full border border-line bg-surface p-1", className)}
      role="tablist"
    >
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "h-9 flex-1 rounded-full text-sm font-semibold transition-colors",
            value === item.value
              ? "bg-accent-soft text-accent"
              : "text-text-dim active:bg-elevated",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
