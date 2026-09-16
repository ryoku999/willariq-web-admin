import { lazy } from "react";

export const DashboardPage = lazy(
  () => import("@/presentation/features/dashboard/DashboardPage"),
);

export const LoginPage = lazy(
  () => import("@/presentation/features/auth/pages/LoginPage"),
);

export const OperatorDashboardPage = lazy(
  () =>
    import("@/presentation/features/operator/dashboard/page/OperatorDashboard"),
);

export const SupervisorDashboardPage = lazy(
  () =>
    import("@/presentation/features/supervisor/dashboard/page/SupervisorDashboardPage"),
);
