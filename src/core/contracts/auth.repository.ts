import type { LoginReq, LoginRes } from "../entities/auth.entity";

export interface AuthRepository {
  login: (dto: LoginReq) => Promise<LoginRes>;
}
