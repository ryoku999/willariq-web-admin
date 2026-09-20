import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type { LoginReq } from "@/core/entities/auth.entity";
import { useAuthStore } from "../storage/auth-storage";

export const useLogin = () => {
  const { setUser } = useAuthStore();

  return useMutation({
    mutationKey: ["web", "logoin"],
    mutationFn: (dto: LoginReq) => authService.login(dto),
    onSuccess: (data) => {
      setUser({
        lastName: data.data.lastName,
        name: data.data.firstName,
        role: data.data.role,
      });
    },
  });
};

export const useLogout = () => {
  const { deleteAuth } = useAuthStore();

  return useMutation({
    mutationKey: ["web", "logout"],
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      deleteAuth();
    },
  });
};
