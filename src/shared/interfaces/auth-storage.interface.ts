export type UserRole = "ADMIN" | "SUPERVISOR" | "OPERATOR";

export interface AuthUser {
  name: string;
  lastName: string;
  role: UserRole;
}

export interface AuthStore {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
}
