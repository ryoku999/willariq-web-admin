import type { UserRole } from "@/shared/interfaces/auth-storage.interface";

// me
export interface UserProfile {
  success: boolean;
  path: string;
  data: UserMeData;
}

export interface UserMeData {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string | null;
  emailVerifiedAt: string | null;
  role: UserRole;
  status: string;
  createdAt: string;
  updatedAt: string;
}
