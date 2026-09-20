import {
  LogOut,
  Menu,
  LayoutDashboard,
  UserRound,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState, type PropsWithChildren } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/infrastructure/storage/auth-storage";
import type { UserRole } from "@/shared/interfaces/auth-storage.interface";

type DashboardLayoutProps = PropsWithChildren<{ role: UserRole }>;

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  OPERATOR: "Operador",
};

const getItems = (role: UserRole) => {
  const prefix = role === "ADMIN" ? "" : `/${role.toLowerCase()}`;
  return [
    { label: "Dashboard", to: prefix || "/", icon: LayoutDashboard, end: true },
    { label: "Mi perfil", to: `${prefix}/profile`, icon: UserRound },
  ];
};

const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const { user, deleteAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = getItems(role);

  const logout = () => {
    deleteAuth();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      {mobileOpen && (
        <button
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-neutral/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-base-300 bg-base-100 p-5 shadow-xl transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-10 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-content">
              <ShieldCheck size={23} />
            </div>
            <span className="text-xl font-bold">Willariq</span>
          </div>
          <button
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.2em] text-base-content/40">
          Menú principal
        </p>
        <nav className="space-y-1">
          {items.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-primary text-primary-content shadow-md shadow-primary/20" : "text-base-content/60 hover:bg-base-200 hover:text-base-content"}`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-base-200 p-3">
          <div className="mb-3 flex items-center gap-3 px-1">
            <div className="avatar placeholder">
              <div className="w-10 rounded-full bg-primary/15 text-primary">
                <span className="font-bold">{user?.name?.[0] ?? "U"}</span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {user?.name} {user?.lastName}
              </p>
              <p className="text-xs text-base-content/50">{roleLabels[role]}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-ghost btn-sm w-full justify-start gap-3 text-error hover:bg-error/10"
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-base-300 bg-base-100/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="btn btn-ghost btn-square lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {roleLabels[role]}
              </p>
              <h1 className="font-bold">
                {items.find((item) => location.pathname === item.to)?.label ??
                  "Panel"}
              </h1>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-outline btn-sm gap-2 border-base-300 text-base-content/70 hover:border-error hover:bg-error hover:text-error-content"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </header>
        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
