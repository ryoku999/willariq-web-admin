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
} from "../entities/users.entity";

export interface UsersRepository {
  userProfile: () => Promise<UserProfile>;
  updateProfile: (dto: UpdateProfileReq) => Promise<UpdateProfileRes>;
  getList: (qry: UsersListQry) => Promise<UsersListRes>;
  getById: (dto: UserByIdReq) => Promise<UserByIdRes>;
  updateStatus: (dto: UpdateStatusReq) => Promise<UpdateStatusRes>;
  updateRole: (dto: UpdateRoleReq) => Promise<UpdateRoleRes>;
}
