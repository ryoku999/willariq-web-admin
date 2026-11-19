import type {
  MuniAreasCreateReq,
  MuniAreasCreateRes,
  MuniAreasGetByIdReq,
  MuniAreasGetByIdRes,
  MuniAreasListQry,
  MuniAreasListRes,
  MuniAreasUpdateReq,
  MuniAreasUpdateRes,
  MuniAreaUpdateStatusReq,
  MuniAreaUpdateStatusRes,
} from "../entities/muni-areas.entity";

export interface MuniAreasRepository {
  list: (qry: MuniAreasListQry) => Promise<MuniAreasListRes>;
  create: (dto: MuniAreasCreateReq) => Promise<MuniAreasCreateRes>;
  getById: (dto: MuniAreasGetByIdReq) => Promise<MuniAreasGetByIdRes>;
  update: (dto: MuniAreasUpdateReq) => Promise<MuniAreasUpdateRes>;
  updateStatus: (
    dto: MuniAreaUpdateStatusReq,
  ) => Promise<MuniAreaUpdateStatusRes>;
}
