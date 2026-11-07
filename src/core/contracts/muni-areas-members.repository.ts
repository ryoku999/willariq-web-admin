import type {
  AddMuniAreaMemberReq,
  AreaMemberCandidate,
  AddMuniAreaMemberRes,
  MuniAreaDeleteMemberReq,
  MuniAreaDeleteMemberRes,
  MuniAreaMembersListReq,
  MuniAreaMembersListRes,
} from "../entities/muni-areas-members.entity";

export interface MuniAreasMembersRepository {
  searchCandidates: (areaId: string, search: string) => Promise<AreaMemberCandidate[]>;
  addMember: (dto: AddMuniAreaMemberReq) => Promise<AddMuniAreaMemberRes>;
  listMembers: (dto: MuniAreaMembersListReq) => Promise<MuniAreaMembersListRes>;
  deleteMember: (
    dto: MuniAreaDeleteMemberReq,
  ) => Promise<MuniAreaDeleteMemberRes>;
}
