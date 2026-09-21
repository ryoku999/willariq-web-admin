import { LogOut, Menu, ShieldCheck, X, ChevronDown } from "lucide-react";
import { useState, type PropsWithChildren } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/infrastructure/storage/auth-storage";
import type { UserRole } from "@/shared/interfaces/auth-storage.interface";
import { useLogout } from "@/infrastructure/hooks/use-auth";
import { allNavItems, matchesPath } from "./dashboard-nav";

type DashboardLayoutProps = PropsWithChildren<{ role: UserRole }>;

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  OPERATOR: "Operador",
};

const DashboardLayout = ({ role }: DashboardLayoutProps) => {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = allNavItems
    .filter((group) => group.role === role)
    .flatMap((group) => group.children);
  const activeItem = items.find((item) =>
    matchesPath(location.pathname, item.to, item.exact),
  );
  const [openMenu, setOpenMenu] = useState<string | null>(
    items.find(
      (item) =>
        item.children?.length &&
        matchesPath(location.pathname, item.to, item.exact),
    )?.label ?? null,
  );

  return (
    <div className="min-h-screen bg-base-200 text-base-content ">
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
          {items.map(({ label, to, icon: Icon, exact, children }) => {
            const hasChildren = Boolean(children?.length);
            const isParentActive =
              matchesPath(location.pathname, to, exact) ||
              Boolean(
                children?.some((child) =>
                  matchesPath(location.pathname, child.to, child.exact),
                ),
              );
            return (
              <div key={to}>
                <div
                  className={`flex items-center rounded-xl text-sm font-semibold transition ${isParentActive ? "bg-primary/10 text-primary" : "text-base-content/60 hover:bg-base-200 hover:text-base-content"}`}
                >
                  <NavLink
                    to={to}
                    end={exact}
                    onClick={() => {
                      setMobileOpen(false);
                      if (hasChildren)
                        setOpenMenu(openMenu === label ? null : label);
                    }}
                    className="flex flex-1 items-center gap-3 px-4 py-3"
                  >
                    <Icon size={19} />
                    {label}
                  </NavLink>
                  {hasChildren && (
                    <button
                      aria-label={`Expandir ${label}`}
                      onClick={() =>
                        setOpenMenu(openMenu === label ? null : label)
                      }
                      className="px-4 py-3"
                    >
                      <ChevronDown
                        size={17}
                        className={`transition-transform ${openMenu === label ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}
                </div>
                {hasChildren && openMenu === label && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-primary/20 pl-3">
                    {(children ?? []).map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        end={child.exact}
                        onClick={() => setMobileOpen(false)}
                        className={() =>
                          `block rounded-lg px-3 py-2 text-sm font-medium ${matchesPath(location.pathname, child.to, child.exact) ? "bg-primary text-primary-content" : "text-base-content/55 hover:bg-base-200 hover:text-base-content"}`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
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
                {activeItem?.children?.find((child) =>
                  matchesPath(location.pathname, child.to, child.exact),
                )?.label ??
                  activeItem?.label ??
                  "Panel"}
              </h1>
            </div>
          </div>
          <button
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
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
