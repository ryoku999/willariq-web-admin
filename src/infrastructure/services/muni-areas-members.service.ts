import http from "@/config/http/axios";
import type { MuniAreasMembersRepository } from "@/core/contracts/muni-areas-members.repository";
import type {
  AddMuniAreaMemberReq,
  AreaMemberCandidate,
  AddMuniAreaMemberRes,
  MuniAreaDeleteMemberReq,
  MuniAreaDeleteMemberRes,
  MuniAreaMembersListReq,
  MuniAreaMembersListRes,
} from "@/core/entities/muni-areas-members.entity";
import type { ApiEnvelope } from "@/shared/interfaces/api-response.interface";
import type { AxiosInstance } from "axios";

class MuniAreasMembersService implements MuniAreasMembersRepository {
  private readonly http: AxiosInstance = http;
  private readonly prefix = "/municipal-areas";

  async searchCandidates(areaId: string, search: string) {
    const { data } = await this.http.get<ApiEnvelope<AreaMemberCandidate[]>>(
      `${this.prefix}/${areaId}/member-candidates`,
      { params: { search } },
    );
    return data.data;
  }

  async addMember(dto: AddMuniAreaMemberReq): Promise<AddMuniAreaMemberRes> {
    const { data } = await this.http.post<ApiEnvelope<AddMuniAreaMemberRes>>(
      `${this.prefix}/${dto.muniAreaId}/members`,
      dto.payload,
    );

    return data.data;
  }

  async listMembers(
    dto: MuniAreaMembersListReq,
  ): Promise<MuniAreaMembersListRes> {
    const { data } = await this.http.get<ApiEnvelope<MuniAreaMembersListRes>>(
      `${this.prefix}/${dto.muniAreaId}/members`,
      {
        params: dto.qry,
      },
    );

    return data.data;
  }

  async deleteMember(
    dto: MuniAreaDeleteMemberReq,
  ): Promise<MuniAreaDeleteMemberRes> {
    const { data } = await this.http.delete<
      ApiEnvelope<MuniAreaDeleteMemberRes>
    >(`${this.prefix}/${dto.muniAreaId}/members/${dto.memberId}`);
    return data.data;
  }
}

export const muniAreasMembersService = new MuniAreasMembersService();
