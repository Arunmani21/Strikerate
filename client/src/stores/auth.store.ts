import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types/user";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  hasHydrated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  clear: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clear: () => set({ token: null, user: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "strikerate-auth",
      partialize: (s) => ({ token: s.token, user: s.user }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);
