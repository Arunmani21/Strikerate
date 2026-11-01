import { NavLink } from "react-router";
import { House, Trophy, Users, Zap, User } from "lucide-react";
import { cn } from "../../lib/cn";

const tabs = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/matches", label: "Matches", icon: Trophy, end: false },
  { to: "/teams", label: "Teams", icon: Users, end: false },
  { to: "/score", label: "Score", icon: Zap, end: false },
  { to: "/profile", label: "Profile", icon: User, end: false },
];

export function BottomTabBar() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t border-line bg-surface/95 backdrop-blur-md">
      <div className="flex h-16 items-stretch">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                isActive ? "text-accent" : "text-text-faint active:text-text-dim",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
