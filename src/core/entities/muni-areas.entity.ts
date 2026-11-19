// muni areas list query
export interface MuniAreasListQry {
  page: number;
  limit: number;
  search: string | undefined;
  status: string | undefined;
}

// muni areas list response
export interface MuniAreasListRes {
  items: MuniAreasListItems[];
  pagination: MuniAreasListPagination;
}

export interface MuniAreasListItems {
  id: string;
  code: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface MuniAreasListPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// muni areas create request
export interface MuniAreasCreateReq {
  code: string;
  name: string;
  description: string;
  phone: string | null;
  email: string | null;
}

// muni areas create response

export interface MuniAreasCreateRes {
  id: string;
  code: string;
  name: string;
  description: string;
  phone: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// muni areas get by id request
export interface MuniAreasGetByIdReq {
  muniAreaId: string;
}

// muni areas get By id response

export interface MuniAreasGetByIdRes {
  id: string;
  code: string;
  name: string;
  description: string;
  phone: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// muni areas update request

export interface MuniAreasUpdateReq {
  payload: UpdateMunicipalAreaPayload;
  muniAreaId: string;
}

export interface UpdateMunicipalAreaPayload {
  name?: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
}

// muni areas update respose

export interface MuniAreasUpdateRes {
  id: string;
  code: string;
  name: string;
  description: string;
  phone: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// muni areas update status request

export const MunicipalAreaStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type MunicipalAreaStatus =
  (typeof MunicipalAreaStatus)[keyof typeof MunicipalAreaStatus];

export interface MuniAreaUpdateStatusReq {
  payload: {
    status: MunicipalAreaStatus;
  };
  muniAreasId: string;
}

// muni areas update status
export interface MuniAreaUpdateStatusRes {
  id: string;
  code: string;
  name: string;
  description: string;
  phone: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}
