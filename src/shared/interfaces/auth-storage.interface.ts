export type UserRole = "ADMIN" | "SUPERVISOR" | "OPERATOR";

export const AUTH_STORE_NAME = "willariq-admin";

export interface AuthUser {
  name: string;
  lastName: string;
  role: UserRole;
}

export interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  deleteAuth: () => void;
}
