import { useAuthStore } from "@/infrastructure/storage/auth-storage";
import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

const GuestGuard = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (isAuthenticated || user) {
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestGuard;
