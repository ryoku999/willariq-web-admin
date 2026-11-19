import type { ManagedUserRole } from "@/core/entities/users.entity";
import { Dialog, Field } from "@/presentation/components/PanelControls";
import { errorMessage } from "@/shared/utils/panel-format";
import { useCreateUser, useUsersList } from "@/infrastructure/hooks/use-users";
import ErrorState from "@/presentation/components/ErrorState";
import LoadingState from "@/presentation/components/LoadingState";
import type { UserStatus } from "@/shared/interfaces/auth-storage.interface";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const roleLabels: Record<ManagedUserRole, string> = {
  CITIZEN: "Ciudadano",
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  OPERATOR: "Operador",
};
const statusLabels: Record<UserStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  BLOCKED: "Bloqueado",
};

function CreateUserForm({ onClose }: { onClose: () => void }) {
  const create = useCreateUser();
  return (
    <Dialog title="Crear usuario" onClose={onClose} busy={create.isPending}>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const value = (key: string) => String(data.get(key) ?? "");
          create.mutate(
            {
              firstName: value("firstName").trim(),
              lastName: value("lastName").trim() || undefined,
              dni: value("dni"),
              phone: value("phone"),
              password: value("password"),
              role: value("role") as ManagedUserRole,
            },
            { onSuccess: onClose },
          );
        }}
      >
        <Field label="Nombres">
          <input
            className="input w-full"
            name="firstName"
            required
            maxLength={80}
          />
        </Field>
        <Field label="Apellidos">
          <input className="input w-full" name="lastName" maxLength={120} />
        </Field>
        <Field label="DNI">
          <input
            className="input w-full"
            name="dni"
            required
            inputMode="numeric"
            pattern="[0-9]{8}"
            maxLength={8}
          />
        </Field>
        <Field label="Teléfono">
          <input
            className="input w-full"
            name="phone"
            required
            inputMode="numeric"
            pattern="[0-9]{9}"
            maxLength={9}
          />
        </Field>
        <Field label="Contraseña inicial">
          <input
            className="input w-full"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
          />
        </Field>
        <Field label="Rol">
          <select className="select w-full" name="role" defaultValue="CITIZEN">
            {Object.entries(roleLabels).map(([role, label]) => (
              <option key={role} value={role}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        {create.error && (
          <p role="alert" className="alert alert-error">
            {errorMessage(create.error)}
          </p>
        )}
        <button className="btn btn-primary" disabled={create.isPending}>
          Crear usuario
        </button>
      </form>
    </Dialog>
  );
}

const UsersListPage = () => {
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<ManagedUserRole | "">("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const query = useUsersList({
    page,
    limit: 10,
    search: search || undefined,
    role: role || undefined,
    status: status || undefined,
  });

  const applyFilter = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(1);
  };
  if (query.isLoading || !query.data)
    return <LoadingState message="Cargando usuarios..." />;
  if (query.isError)
    return (
      <ErrorState
        title="No se pudo cargar la lista"
        message="Ocurrió un error al consultar los usuarios."
        onRetry={query.refetch}
      />
    );

  const result = query.data;
  const totalPages = result.pagination.pages || 1;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Administración
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="mt-2 text-sm text-base-content/60">
            Gestiona los accesos y consulta el perfil de cada usuario.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setCreating(true)}
        >
          Crear usuario
        </button>
        <div className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
          <UsersRound className="mr-2 inline" size={18} />
          {result.pagination.total} usuarios
        </div>
      </div>

      {creating && <CreateUserForm onClose={() => setCreating(false)} />}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="input input-bordered flex flex-1 items-center gap-2 focus-within:input-primary">
            <Search size={18} className="text-base-content/45" />
            <input
              value={search}
              onChange={(event) => applyFilter(setSearch, event.target.value)}
              placeholder="Buscar por nombre, DNI o correo..."
            />
          </label>
          <select
            className="select select-bordered lg:w-52"
            value={role}
            onChange={(event) =>
              applyFilter(setRole, event.target.value as ManagedUserRole | "")
            }
          >
            <option value="">Todos los roles</option>
            {Object.entries(roleLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered lg:w-44"
            value={status}
            onChange={(event) =>
              applyFilter(setStatus, event.target.value as UserStatus | "")
            }
          >
            <option value="">Todos los estados</option>
            {Object.entries(statusLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setSearch("");
              setRole("");
              setStatus("");
              setPage(1);
            }}
          >
            Limpiar filtros
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>DNI</th>
                <th>Rol</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((user) => (
                <tr key={user.id} className="hover:bg-base-200/60">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-primary/10 font-bold text-primary">
                        {user.firstName[0]}
                        {user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-base-content/50">
                          {user.email ?? "Sin correo"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{user.dni}</td>
                  <td>
                    <span className="badge badge-ghost">
                      {roleLabels[user.role as ManagedUserRole] ?? user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${user.status === "ACTIVE" ? "badge-success" : user.status === "BLOCKED" ? "badge-error" : "badge-ghost"}`}
                    >
                      {statusLabels[user.status as UserStatus] ?? user.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <Link
                      className="btn btn-ghost btn-sm gap-2 text-primary"
                      to={`/users/${user.id}/details`}
                    >
                      <Eye size={16} /> Ver perfil
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!result.items.length && (
            <p className="py-10 text-center text-sm text-base-content/55">
              No se encontraron usuarios con esos filtros.
            </p>
          )}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-base-300 pt-4 text-sm">
          <span className="text-base-content/55">
            Página {result.pagination.page} de {totalPages}
          </span>
          <div className="join">
            <button
              className="btn btn-sm join-item"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="btn btn-sm join-item"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UsersListPage;
