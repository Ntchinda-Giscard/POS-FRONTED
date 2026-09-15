import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PosUser } from "@/lib/api";

interface UserState {
  currentUser: PosUser | null;
  setUser: (user: PosUser | null) => void;
  logout: () => void;
}

// The signed-in cashier survives a reload (localStorage); the PIN never does.
const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      setUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: null }),
    }),
    { name: "pos-user" }
  )
);

export default useUserStore;
