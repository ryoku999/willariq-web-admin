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

export const ProfilePage = lazy(
  () => import("@/presentation/features/users/page/ProfilePage"),
);

export const UsersListPage = lazy(
  () => import("@/presentation/features/admin/users/pages/UsersListPage"),
);

export const UsersDeatilsPage = lazy(
  () => import("@/presentation/features/admin/users/pages/UsersDeatilsPage"),
);
