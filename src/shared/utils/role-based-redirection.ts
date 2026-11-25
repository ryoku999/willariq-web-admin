import type { UserRole } from "../interfaces/auth-storage.interface";

export const roleBasedRedirection = (role: UserRole) => {
  switch (role) {
    case "ADMIN":
      return "/";
    case "OPERATOR":
      return "/operator";
    default:
      return "/login";
  }
};
