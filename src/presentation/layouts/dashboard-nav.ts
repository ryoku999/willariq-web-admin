import {
  LayoutDashboard,
  UserRound,
  UsersRound,
  Bell,
  Building2,
  ClipboardList,
  MapPin,
  Settings2,
  Activity,
  BookOpen,
  FileClock,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/shared/interfaces/auth-storage.interface";

export type MenuItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  exact?: boolean;
  children?: { label: string; to: string; exact?: boolean }[];
};

type NavGroup = { role: UserRole; children: MenuItem[] };

const operations = (prefix: string): MenuItem[] => [
  { label: "Incidencias", to: `${prefix}/incidents`, icon: MapPin },
  {
    label: "Mis asignaciones",
    to: `${prefix}/assignments`,
    icon: ClipboardList,
  },
  {
    label: "Áreas municipales",
    to: `${prefix}/municipal-areas`,
    icon: Building2,
  },
  { label: "Notificaciones", to: `${prefix}/notifications`, icon: Bell },
];

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
      ...operations(""),
      { label: "Configuración IA", to: "/ai/configuration", icon: Settings2 },
      { label: "Trabajos y outbox", to: "/ai/jobs", icon: Activity },
      { label: "Conocimiento", to: "/knowledge", icon: BookOpen },
      { label: "Auditoría", to: "/audit", icon: FileClock },
      { label: "Chatbot", to: "/chat", icon: MessagesSquare },
      { label: "Mi perfil", to: "/profile", icon: UserRound },
    ],
  },
  {
    role: "SUPERVISOR",
    children: [
      {
        label: "Dashboard",
        to: "/supervisor",
        icon: LayoutDashboard,
        exact: true,
      },
      ...operations("/supervisor"),
      { label: "Trabajos IA", to: "/supervisor/ai/jobs", icon: Activity },
      { label: "Mi perfil", to: "/supervisor/profile", icon: UserRound },
    ],
  },
  {
    role: "OPERATOR",
    children: [
      {
        label: "Dashboard",
        to: "/operator",
        icon: LayoutDashboard,
        exact: true,
      },
      ...operations("/operator"),
      { label: "Mi perfil", to: "/operator/profile", icon: UserRound },
    ],
  },
];

export const matchesPath = (pathname: string, to: string, exact = false) =>
  pathname === to || (!exact && to !== "/" && pathname.startsWith(`${to}/`));
