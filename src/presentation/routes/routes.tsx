import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import {
  DashboardPage,
  LoginPage,
  OperatorDashboardPage,
  ProfilePage,
  SupervisorDashboardPage,
  UsersDeatilsPage,
  UsersListPage,
} from "./lazy-routes";
import AuthLayout from "../layouts/AuthLayout";
import { Suspense } from "react";
import LazyLoading from "../components/LazyLoading";
import AuthGuard from "../guards/AuthGuard";
import GuestGuard from "../guards/GuestGuard";
import NotFoundPage from "../components/NotFoundPage";
import OperatorLayout from "../layouts/OperatorLayout";
import SupervisorLayout from "../layouts/SupervisorLayout";
import RoleGuard from "../guards/RoleGuard";
import ErrorState from "../components/ErrorState";

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
    path: "*",
    element: <NotFoundPage />,
  },
]);
