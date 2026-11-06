import type { UserRole } from "@/shared/interfaces/auth-storage.interface";

// muni areas members - asiganar miembro request
export const AreaMemberRole = {
  MANAGER: "MANAGER",
  OPERATOR: "OPERATOR",
} as const;

export type AreaMemberRole =
  (typeof AreaMemberRole)[keyof typeof AreaMemberRole];

export interface AddMuniAreaMemberReq {
  payload: AddMuniAreaMemberPayload;
  muniAreaId: string;
}
export interface AddMuniAreaMemberPayload {
  userId: string;
  role: AreaMemberRole;
}

// muni area members - asignar miembro response

export interface AddMuniAreaMemberRes {
  id: string;
  areaId: string;
  userId: string;
  role: AreaMemberRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    role: UserRole;
    status: string;
  };
}

// muni area members - lista de miembros qry
export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BLOCKED: "BLOCKED",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export interface MuniAreaMembersListReq {
  qry: {
    page?: number;
    limit?: number;
    search?: string;
    role?: AreaMemberRole;
    active?: boolean;
    userRole?: UserRole;
    userStatus?: UserStatus;
  };
  muniAreaId: string;
}

// muni area members - lista de miembros response

export interface MuniAreaMembersListRes {
  items: MuniAreaMembersListItem[];
  pagination: Pagination;
}

export interface MuniAreaMembersListItem {
  id: string;
  areaId: string;
  userId: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    role: UserRole;
    status: UserStatus;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// muni area members - borrar miembro  request

export interface MuniAreaDeleteMemberReq {
  muniAreaId: string;
  memberId: string;
}

// muni area members - borrar miembro  response

export interface MuniAreaDeleteMemberRes {
  id: string;
  areaId: string;
  userId: string;
  role: AreaMemberRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    role: UserRole;
    status: UserStatus;
  };
}
