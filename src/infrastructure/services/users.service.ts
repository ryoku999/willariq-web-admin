import http from "@/config/http/axios";
import type { UsersRepository } from "@/core/contracts/users.repository";
import type { UserProfile } from "@/core/entities/users.entity";
import type { AxiosInstance } from "axios";

class UsersService implements UsersRepository {
  private readonly http: AxiosInstance = http;
  private readonly prefix = "/users";

  async userProfile(): Promise<UserProfile> {
    const { data } = await this.http.get<UserProfile>(`${this.prefix}/me`);
    return data;
  }
}

export const usersService = new UsersService();
