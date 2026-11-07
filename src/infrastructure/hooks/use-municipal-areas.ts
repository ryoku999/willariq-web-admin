import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  MuniAreasCreateReq,
  MuniAreasUpdateReq,
  MuniAreaUpdateStatusReq,
} from "@/core/entities/muni-areas.entity";
import type {
  AddMuniAreaMemberReq,
  MuniAreaDeleteMemberReq,
} from "@/core/entities/muni-areas-members.entity";
import { muniAreasService as areas } from "../services/muni-areas.service";
import { muniAreasMembersService as members } from "../services/muni-areas-members.service";

export const useAreas = (
  page = 1,
  search?: string,
  status?: string,
  limit = 20,
) =>
  useQuery({
    queryKey: ["municipal-areas", page, search, status, limit],
    queryFn: () => areas.list({ page, limit, search, status }),
  });
export const useAreaMembers = (
  id: string,
  page = 1,
  active = true,
  limit = 20,
) =>
  useQuery({
    queryKey: ["municipal-areas", id, "members", page, active, limit],
    queryFn: () =>
      members.listMembers({ muniAreaId: id, qry: { page, limit, active } }),
    enabled: !!id,
  });
type AreaMutation =
  | { type: "create"; data: MuniAreasCreateReq }
  | { type: "update"; data: MuniAreasUpdateReq }
  | { type: "status"; data: MuniAreaUpdateStatusReq }
  | { type: "add"; data: AddMuniAreaMemberReq }
  | { type: "remove"; data: MuniAreaDeleteMemberReq };
export function useAreaMutation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (action: AreaMutation) => {
      switch (action.type) {
        case "create":
          return areas.create(action.data);
        case "update":
          return areas.update(action.data);
        case "status":
          return areas.updateStatus(action.data);
        case "add":
          return members.addMember(action.data);
        case "remove":
          return members.deleteMember(action.data);
      }
    },
    onSuccess: () =>
      Promise.all([
        cache.invalidateQueries({ queryKey: ["municipal-areas"] }),
        cache.invalidateQueries({ queryKey: ["operations"] }),
      ]),
  });
}
