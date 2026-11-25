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


export const ProfilePage = lazy(
  () => import("@/presentation/features/users/page/ProfilePage"),
);

export const UsersListPage = lazy(
  () => import("@/presentation/features/admin/users/pages/UsersListPage"),
);

export const UsersDeatilsPage = lazy(
  () => import("@/presentation/features/admin/users/pages/UsersDeatilsPage"),
);

export const IncidentsPage = lazy(
  () => import("@/presentation/features/operations/IncidentsPage"),
);
export const IncidentDetailPage = lazy(
  () => import("@/presentation/features/operations/IncidentDetailPage"),
);
export const AiConfigurationPage = lazy(
  () => import("@/presentation/features/admin/operations/AiConfigurationPage"),
);
export const MonitoringPage = lazy(() =>
  import("@/presentation/features/admin/operations/MonitoringPage").then(
    (module) => ({ default: module.MonitoringPage }),
  ),
);
export const AuditPage = lazy(() =>
  import("@/presentation/features/admin/operations/MonitoringPage").then(
    (module) => ({ default: module.AuditPage }),
  ),
);
export const KnowledgePage = lazy(
  () => import("@/presentation/features/admin/operations/KnowledgePage"),
);
export const NotificationsPage = lazy(
  () => import("@/presentation/features/engagement/NotificationsPage"),
);
export const ChatPage = lazy(
  () => import("@/presentation/features/engagement/ChatPage"),
);
export const PublicAccountPage = lazy(() =>
  import("@/presentation/features/engagement/AccountPages").then((module) => ({
    default: module.PublicAccountPage,
  })),
);
