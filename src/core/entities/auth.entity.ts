import type { UserRole } from "@/shared/interfaces/auth-storage.interface";

// login request
export interface LoginReq {
  dni: string;
  password: string;
}

// login response

export interface LoginRes {
  dni: string;
  email: string | null;
  emailVerifiedAt: string | null;
  firstName: string;
  id: string;
  lastName: string;
  phone: string;
  role: UserRole;
  status: string;
}

// logout

export interface LogoutRes {
  message: string;
}
