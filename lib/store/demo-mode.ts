import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DemoModeState {
  active: boolean;
  activate: () => void;
  reset: () => void;
}

/**
 * Real, shared, persisted app state (not decorative) — this is the single source of truth for
 * whether the demo wallet is active, read by the shell badge and any page that wants to gate on
 * it. Persisted to localStorage only as a plain boolean flag: no address, balance, or wallet
 * data is stored anywhere, since none of that exists in this build.
 */
export const useDemoMode = create<DemoModeState>()(
  persist(
    (set) => ({
      active: false,
      activate: () => set({ active: true }),
      reset: () => set({ active: false }),
    }),
    { name: "satovanta-demo-mode" },
  ),
);
