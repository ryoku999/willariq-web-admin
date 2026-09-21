import type {
  UserRole,
  UserStatus,
} from "@/shared/interfaces/auth-storage.interface";

// me
export interface UserProfile {
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

// update profile request
export interface UpdateProfileReq {
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
}

// update profile response

export interface UpdateProfileRes {
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

// users list query
export interface UsersListQry {
  page: number;
  limit: number;
  search: string | undefined;
  role: UserRole | undefined;
  status: UserStatus | undefined;
}

// users list response
export interface UsersListRes {
  items: {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    email: string | null;
    emailVerifiedAt: string | null;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// get user by id request
export interface UserByIdReq {
  userId: string;
}

// get user by id response
export interface UserByIdRes {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string | null;
  emailVerifiedAt: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// update status request
export interface UpdateStatusReq {
  userId: string;
  status: UserStatus;
}
// update status response
export interface UpdateStatusRes {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string | null;
  emailVerifiedAt: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// update role request
export interface UpdateRoleReq {
  userId: string;
  role: UserRole;
}
// update status response
export interface UpdateRoleRes {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  email: string | null;
  emailVerifiedAt: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
