import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type { LoginReq } from "@/core/entities/auth.entity";
import { useAuthStore } from "../storage/auth-storage";
import { endSession } from "@/config/http/auth-session";

export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationKey: ["web", "login"],
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
  return useMutation({
    mutationKey: ["web", "logout"],
    mutationFn: () => authService.logout(),
    onSettled: endSession,
  });
};
