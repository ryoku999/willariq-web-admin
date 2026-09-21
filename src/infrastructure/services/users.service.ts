import http from "@/config/http/axios";
import type { UsersRepository } from "@/core/contracts/users.repository";
import type {
  UpdateProfileReq,
  UpdateProfileRes,
  UpdateRoleReq,
  UpdateRoleRes,
  UpdateStatusReq,
  UpdateStatusRes,
  UserByIdReq,
  UserByIdRes,
  UserProfile,
  UsersListQry,
  UsersListRes,
} from "@/core/entities/users.entity";
import type { ApiEnvelope } from "@/shared/interfaces/api-response.interface";
import type { AxiosInstance } from "axios";

class UsersService implements UsersRepository {
  private readonly http: AxiosInstance = http;
  private readonly prefix = "/users";

  async userProfile(): Promise<UserProfile> {
    const { data } = await this.http.get<ApiEnvelope<UserProfile>>(
      `${this.prefix}/me`,
    );

    return data.data;
  }

  async updateProfile(dto: UpdateProfileReq): Promise<UpdateProfileRes> {
    const { data } = await this.http.patch<ApiEnvelope<UpdateProfileRes>>(
      `${this.prefix}/me`,
      dto,
    );
    return data.data;
  }

  async getList(qry: UsersListQry): Promise<UsersListRes> {
    const { data } = await this.http.get<ApiEnvelope<UsersListRes>>(
      `${this.prefix}`,
      {
        params: qry,
      },
    );
    return data.data;
  }

  async getById(dto: UserByIdReq): Promise<UserByIdRes> {
    const { data } = await this.http.get<ApiEnvelope<UserByIdRes>>(
      `${this.prefix}/${dto.userId}`,
    );

    return data.data;
  }

  async updateStatus(dto: UpdateStatusReq): Promise<UpdateStatusRes> {
    const { data } = await this.http.patch<ApiEnvelope<UpdateStatusRes>>(
      `${this.prefix}/${dto.userId}/status`,
      {
        status: dto.status,
      },
    );

    return data.data;
  }

  async updateRole(dto: UpdateRoleReq): Promise<UpdateRoleRes> {
    const { data } = await this.http.patch<ApiEnvelope<UpdateRoleRes>>(
      `${this.prefix}/${dto.userId}/role`,
      {
        role: dto.role,
      },
    );

    return data.data;
  }
}

export const usersService = new UsersService();
