import { useAuthStore } from "@/infrastructure/storage/auth-storage";
import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";

const GuestGuard = ({ children }: PropsWithChildren) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (user) {
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestGuard;
