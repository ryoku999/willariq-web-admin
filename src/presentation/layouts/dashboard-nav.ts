import { LayoutDashboard, UserRound, UsersRound, type LucideIcon } from "lucide-react";
import type { UserRole } from "@/shared/interfaces/auth-storage.interface";

export type MenuItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  exact?: boolean;
  children?: { label: string; to: string; exact?: boolean }[];
};

type NavGroup = { role: UserRole; children: MenuItem[] };

export const allNavItems: NavGroup[] = [
  {
    role: "ADMIN",
    children: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard, exact: true },
      {
        label: "Usuarios",
        to: "/users",
        icon: UsersRound,
        children: [{ label: "Lista de usuarios", to: "/users", exact: true }],
      },
      { label: "Mi perfil", to: "/profile", icon: UserRound },
    ],
  },
  {
    role: "SUPERVISOR",
    children: [
      { label: "Dashboard", to: "/supervisor", icon: LayoutDashboard, exact: true },
      { label: "Mi perfil", to: "/supervisor/profile", icon: UserRound },
    ],
  },
  {
    role: "OPERATOR",
    children: [
      { label: "Dashboard", to: "/operator", icon: LayoutDashboard, exact: true },
      { label: "Mi perfil", to: "/operator/profile", icon: UserRound },
    ],
  },
];

export const matchesPath = (pathname: string, to: string, exact = false) =>
  pathname === to || (!exact && to !== "/" && pathname.startsWith(`${to}/`));
