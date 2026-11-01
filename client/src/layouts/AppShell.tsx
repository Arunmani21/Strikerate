import { Outlet } from "react-router";
import { BottomTabBar } from "../components/ui/BottomTabBar";

export function AppShell() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <main className="flex-1 pb-24">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  );
}
