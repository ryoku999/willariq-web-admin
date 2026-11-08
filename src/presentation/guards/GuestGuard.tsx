import { useAuthStore } from "@/infrastructure/storage/auth-storage";
import { useEffect, type PropsWithChildren } from "react";
import { authService } from "@/infrastructure/services/auth.service";
import { endSession } from "@/config/http/auth-session";
import { roleBasedRedirection } from "@/shared/utils/role-based-redirection";
import { Navigate, useLocation } from "react-router-dom";

const GuestGuard = ({ children }: PropsWithChildren) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const unsupported = !!user && roleBasedRedirection(user.role) === "/login";
  useEffect(() => {
    if (unsupported)
      void authService
        .logout()
        .finally(endSession)
        .catch(() => undefined);
  }, [unsupported]);

  if (unsupported) return <p role="status">Cerrando la sesión anterior…</p>;

  if (user) {
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestGuard;
