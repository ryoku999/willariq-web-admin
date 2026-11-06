import http from "@/config/http/axios";
import type { MuniAreasRepository } from "@/core/contracts/muni-areas-repository";
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
} from "@/core/entities/muni-areas.entity";
import type { ApiEnvelope } from "@/shared/interfaces/api-response.interface";
import type { AxiosInstance } from "axios";

class MuniAreasService implements MuniAreasRepository {
  private readonly http: AxiosInstance = http;
  private readonly prefix = "/municipal-areas";

  async list(qry: MuniAreasListQry): Promise<MuniAreasListRes> {
    const { data } = await this.http.get<ApiEnvelope<MuniAreasListRes>>(
      this.prefix,
      {
        params: qry,
      },
    );

    return data.data;
  }

  async create(dto: MuniAreasCreateReq): Promise<MuniAreasCreateRes> {
    const { data } = await this.http.post<ApiEnvelope<MuniAreasCreateRes>>(
      this.prefix,
      dto,
    );

    return data.data;
  }

  async getById(dto: MuniAreasGetByIdReq): Promise<MuniAreasGetByIdRes> {
    const { data } = await this.http.get<ApiEnvelope<MuniAreasGetByIdRes>>(
      `${this.prefix}/${dto.muniAreaId}`,
    );

    return data.data;
  }

  async update(dto: MuniAreasUpdateReq): Promise<MuniAreasUpdateRes> {
    const { data } = await this.http.patch<ApiEnvelope<MuniAreasUpdateRes>>(
      `${this.prefix}/${dto.muniAreaId}`,
      dto.payload,
    );
    return data.data;
  }

  async updateStatus(
    dto: MuniAreaUpdateStatusReq,
  ): Promise<MuniAreaUpdateStatusRes> {
    const { data } = await this.http.patch(
      `${this.prefix}/${dto.muniAreasId}`,
      dto.payload,
    );

    return data.data;
  }
}

export const muniAreasService = new MuniAreasService();
