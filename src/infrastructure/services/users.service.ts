import http from "@/config/http/axios";
import type { UsersRepository } from "@/core/contracts/users.repository";
import type { UserProfile } from "@/core/entities/users.entity";
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
}

export const usersService = new UsersService();
