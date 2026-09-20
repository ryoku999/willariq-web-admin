import http from "@/config/http/axios";
import type { AuthRepository } from "@/core/contracts/auth.repository";
import type {
  LoginReq,
  LoginRes,
  LogoutRes,
} from "@/core/entities/auth.entity";
import type { AxiosInstance } from "axios";

class AuthService implements AuthRepository {
  private readonly http: AxiosInstance = http;
  private readonly prefix = "/auth/web";

  async login(dto: LoginReq): Promise<LoginRes> {
    const { data } = await this.http.post<LoginRes>(
      `${this.prefix}/login`,
      dto,
    );
    return data;
  }

  async logout(): Promise<LogoutRes> {
    const { data } = await this.http.post<LogoutRes>(`${this.prefix}/logout`);
    return data;
  }
}

export const authService = new AuthService();
