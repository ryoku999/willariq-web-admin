import type {
  AddMuniAreaMemberReq,
  AddMuniAreaMemberRes,
  MuniAreaDeleteMemberReq,
  MuniAreaDeleteMemberRes,
  MuniAreaMembersListReq,
  MuniAreaMembersListRes,
} from "../entities/muni-areas-members.entity";

export interface MuniAreasMembersRepository {
  addMember: (dto: AddMuniAreaMemberReq) => Promise<AddMuniAreaMemberRes>;
  listMembers: (dto: MuniAreaMembersListReq) => Promise<MuniAreaMembersListRes>;
  deleteMember: (
    dto: MuniAreaDeleteMemberReq,
  ) => Promise<MuniAreaDeleteMemberRes>;
}
