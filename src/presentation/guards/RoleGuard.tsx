import { useAuthStore } from "@/infrastructure/storage/auth-storage";
import type { UserRole } from "@/shared/interfaces/auth-storage.interface";
import { roleBasedRedirection } from "@/shared/utils/role-based-redirection";
import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";

type props = PropsWithChildren<{ allowedRoles: UserRole[] }>;

const RoleGuard = ({ children, allowedRoles }: props) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const redirectPath = roleBasedRedirection(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default RoleGuard;
