import { useQuery } from "@tanstack/react-query";
import { usersService } from "../services/users.service";

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => usersService.userProfile(),
  });
};
