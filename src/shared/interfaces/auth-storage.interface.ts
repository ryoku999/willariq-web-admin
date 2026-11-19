export type UserRole = "ADMIN" | "SUPERVISOR" | "OPERATOR";
export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BLOCKED: "BLOCKED",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

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
