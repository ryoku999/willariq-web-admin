import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import {
  AreasPage,
  AuditPage,
  AiConfigurationPage,
  ChatPage,
  IncidentDetailPage,
  IncidentsPage,
  KnowledgePage,
  MonitoringPage,
  MyAssignmentsPage,
  NotificationsPage,
  PublicAccountPage,
  DashboardPage,
  LoginPage,
  OperatorDashboardPage,
  ProfilePage,
  SupervisorDashboardPage,
  UsersDeatilsPage,
  UsersListPage,
} from "./lazy-routes";
import AuthLayout from "../layouts/AuthLayout";
import { Suspense, type ReactNode } from "react";
import LazyLoading from "../components/LazyLoading";
import AuthGuard from "../guards/AuthGuard";
import GuestGuard from "../guards/GuestGuard";
import NotFoundPage from "../components/NotFoundPage";
import OperatorLayout from "../layouts/OperatorLayout";
import SupervisorLayout from "../layouts/SupervisorLayout";
import RoleGuard from "../guards/RoleGuard";
import ErrorState from "../components/ErrorState";

const screen = (path: string, page: ReactNode) => ({
  path,
  element: <Suspense fallback={<LazyLoading />}>{page}</Suspense>,
});

const operationRoutes = (prefix: string) => [
  screen(`${prefix}/incidents`, <IncidentsPage />),
  screen(`${prefix}/incidents/:id`, <IncidentDetailPage />),
  screen(`${prefix}/municipal-areas`, <AreasPage />),
  screen(`${prefix}/notifications`, <NotificationsPage />),
  screen(`${prefix}/assignments`, <MyAssignmentsPage />),
];

export const routes = createBrowserRouter([
  {
    errorElement: <ErrorState />,
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["ADMIN"]}>
          <AdminLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      ...operationRoutes(""),
      screen("/ai/configuration", <AiConfigurationPage />),
      screen("/ai/jobs", <MonitoringPage />),
      screen("/knowledge", <KnowledgePage />),
      screen("/audit", <AuditPage />),
      screen("/chat", <ChatPage />),
      {
        path: "/",
        element: (
          <Suspense fallback={<LazyLoading />}>
            <DashboardPage />,
          </Suspense>
        ),
      },

      {
        path: "/profile",
        element: (
          <Suspense fallback={<LazyLoading />}>
            <ProfilePage />,
          </Suspense>
        ),
      },
      {
        path: "/users",
        element: (
          <Suspense fallback={<LazyLoading />}>
            <UsersListPage />
          </Suspense>
        ),
      },
      {
        path: "/users/:userId/details",
        element: (
          <Suspense fallback={<LazyLoading />}>
            <UsersDeatilsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["OPERATOR"]}>
          <OperatorLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      ...operationRoutes("/operator"),

      {
        path: "/operator",
        element: (
          <Suspense fallback={<LazyLoading />}>
            <OperatorDashboardPage />
          </Suspense>
        ),
      },

      {
        path: "/operator/profile",
        element: (
          <Suspense fallback={<LazyLoading />}>
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["SUPERVISOR"]}>
          <SupervisorLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      ...operationRoutes("/supervisor"),
      screen("/supervisor/ai/jobs", <MonitoringPage />),
      {
        path: "/supervisor",
        element: (
          <Suspense fallback={<LazyLoading />}>
            <SupervisorDashboardPage />
          </Suspense>
        ),
      },

      {
        path: "/supervisor/profile",
        element: (
          <Suspense fallback={<LazyLoading />}>
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: (
      <GuestGuard>
        <AuthLayout />
      </GuestGuard>
    ),
    children: [
      {
        path: "/login",
        element: (
          <Suspense fallback={<LazyLoading />}>
            <LoginPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      screen("/recuperar-contrasena", <PublicAccountPage mode="forgot" />),
      screen("/restablecer-contrasena", <PublicAccountPage mode="reset" />),
      screen("/verificar-correo", <PublicAccountPage mode="verify" />),
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
