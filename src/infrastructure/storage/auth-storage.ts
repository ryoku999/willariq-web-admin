import {
  AUTH_STORE_NAME,
  type AuthStore,
  type AuthUser,
} from "@/shared/interfaces/auth-storage.interface";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user: AuthUser) =>
        set({
          user,
          isAuthenticated: true,
        }),
      deleteAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
        localStorage.removeItem(AUTH_STORE_NAME);
      },
    }),
    {
      name: AUTH_STORE_NAME,
    },
  ),
);
