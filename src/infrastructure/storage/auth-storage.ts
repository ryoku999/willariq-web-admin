import type {
  AuthStore,
  AuthUser,
} from "@/shared/interfaces/auth-storage.interface";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const AUTH_STORE_NAME = "willariq-admin";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: AuthUser) => set({ user }),
      clearSession: () => set({ user: null }),
    }),
    {
      name: AUTH_STORE_NAME,
    },
  ),
);
