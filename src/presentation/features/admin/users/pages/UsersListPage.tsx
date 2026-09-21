import { useUsersList } from "@/infrastructure/hooks/use-users";
import ErrorState from "@/presentation/components/ErrorState";
import LoadingState from "@/presentation/components/LoadingState";
import type { UserRole, UserStatus } from "@/shared/interfaces/auth-storage.interface";
import { ChevronLeft, ChevronRight, Eye, Filter, Search, UsersRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const roleLabels: Record<UserRole, string> = { ADMIN: "Administrador", SUPERVISOR: "Supervisor", OPERATOR: "Operador" };
const statusLabels: Record<UserStatus, string> = { ACTIVE: "Activo", INACTIVE: "Inactivo", BLOCKED: "Bloqueado" };

const UsersListPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const query = useUsersList({ page, limit: 10, search: search || undefined, role: role || undefined, status: status || undefined });

  const applyFilter = <T,>(setter: (value: T) => void, value: T) => { setter(value); setPage(1); };
  if (query.isLoading || !query.data) return <LoadingState message="Cargando usuarios..." />;
  if (query.isError) return <ErrorState title="No se pudo cargar la lista" message="Ocurrió un error al consultar los usuarios." onRetry={query.refetch} />;

  const result = query.data;
  const totalPages = result.pagination.pages || 1;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Administración</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="mt-2 text-sm text-base-content/60">Gestiona los accesos y consulta el perfil de cada usuario.</p>
        </div>
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"><UsersRound className="mr-2 inline" size={18} />{result.pagination.total} usuarios</div>
      </div>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="input input-bordered flex flex-1 items-center gap-2 focus-within:input-primary">
            <Search size={18} className="text-base-content/45" />
            <input value={search} onChange={(event) => applyFilter(setSearch, event.target.value)} placeholder="Buscar por nombre, DNI o correo..." />
          </label>
          <select className="select select-bordered lg:w-52" value={role} onChange={(event) => applyFilter(setRole, event.target.value as UserRole | "")}>
            <option value="">Todos los roles</option>{Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <select className="select select-bordered lg:w-44" value={status} onChange={(event) => applyFilter(setStatus, event.target.value as UserStatus | "")}>
            <option value="">Todos los estados</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <div className="hidden items-center justify-center rounded-xl bg-base-200 px-3 lg:flex"><Filter size={18} className="text-base-content/45" /></div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="table">
            <thead><tr><th>Usuario</th><th>DNI</th><th>Rol</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
            <tbody>{result.items.map((user) => (
              <tr key={user.id} className="hover:bg-base-200/60">
                <td><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-primary/10 font-bold text-primary">{user.firstName[0]}{user.lastName[0]}</div><div><p className="font-semibold">{user.firstName} {user.lastName}</p><p className="text-xs text-base-content/50">{user.email ?? "Sin correo"}</p></div></div></td>
                <td>{user.dni}</td><td><span className="badge badge-ghost">{roleLabels[user.role as UserRole] ?? user.role}</span></td>
                <td><span className={`badge ${user.status === "ACTIVE" ? "badge-success" : user.status === "BLOCKED" ? "badge-error" : "badge-ghost"}`}>{statusLabels[user.status as UserStatus] ?? user.status}</span></td>
                <td className="text-right"><Link className="btn btn-ghost btn-sm gap-2 text-primary" to={`/users/${user.id}/details`}><Eye size={16} /> Ver perfil</Link></td>
              </tr>
            ))}</tbody>
          </table>
          {!result.items.length && <p className="py-10 text-center text-sm text-base-content/55">No se encontraron usuarios con esos filtros.</p>}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-base-300 pt-4 text-sm"><span className="text-base-content/55">Página {result.pagination.page} de {totalPages}</span><div className="join"><button className="btn btn-sm join-item" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button><button className="btn btn-sm join-item" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button></div></div>
      </section>
    </div>
  );
};

export default UsersListPage;
