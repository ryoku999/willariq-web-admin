import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import {
  DashboardPage,
  LoginPage,
  OperatorDashboardPage,
  SupervisorDashboardPage,
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

export const routes = createBrowserRouter([
  {
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["ADMIN"]}>
          <AdminLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      {
        path: "/admin",
        element: (
          <Suspense fallback={<LazyLoading />}>
            <DashboardPage />,
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
