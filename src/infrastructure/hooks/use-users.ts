import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { usersService } from "../services/users.service";
import type {
  UpdateProfileReq,
  UpdateRoleReq,
  UpdateStatusReq,
  UserByIdReq,
  UsersListQry,
} from "@/core/entities/users.entity";
import { useAuthStore } from "../storage/auth-storage";

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => usersService.userProfile(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationKey: ["update", "profile"],
    mutationFn: (dto: UpdateProfileReq) => usersService.updateProfile(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(["user", "profile"], data);
      queryClient.invalidateQueries({
        queryKey: ["user", "profile"],
        refetchType: "none",
      });
      setUser({
        name: data.firstName,
        lastName: data.lastName,
        role: data.role,
      });
    },
  });
};

export const useUsersList = (qry: UsersListQry) => {
  return useQuery({
    queryKey: ["users", "list", qry],
    queryFn: () => usersService.getList(qry),
    placeholderData: keepPreviousData,
  });
};

export const useGetUserById = (dto: UserByIdReq) => {
  return useQuery({
    queryKey: ["user", "by", dto],
    queryFn: () => usersService.getById(dto),
  });
};

export const useUserUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["user", "update", "status"],
    mutationFn: (dto: UpdateStatusReq) => usersService.updateStatus(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      queryClient.setQueryData(["user", "by", { userId: data.id }], data);
    },
  });
};

export const useUserUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["user", "update", "role"],
    mutationFn: (dto: UpdateRoleReq) => usersService.updateRole(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      queryClient.setQueryData(["user", "by", { userId: data.id }], data);
    },
  });
};
