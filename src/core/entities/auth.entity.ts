import type { UserRole } from "@/shared/interfaces/auth-storage.interface";

// login request
export interface LoginReq {
  dni: string;
  password: string;
}

// login response

export interface LoginRes {
  success: boolean;
  path: string;
  data: LoginResData;
}

export interface LoginResData {
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
