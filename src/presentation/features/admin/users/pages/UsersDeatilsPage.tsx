import {
  useGetUserById,
  useUserUpdateRole,
  useUserUpdateStatus,
} from "@/infrastructure/hooks/use-users";
import ErrorState from "@/presentation/components/ErrorState";
import LoadingState from "@/presentation/components/LoadingState";
import type {
  UserRole,
  UserStatus,
} from "@/shared/interfaces/auth-storage.interface";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  IdCard,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  OPERATOR: "Operador",
};
const statusLabels: Record<UserStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  BLOCKED: "Bloqueado",
};
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-PE", { dateStyle: "long" }).format(
    new Date(value),
  );

const UsersDeatilsPage = () => {
  const { userId } = useParams();

  const query = useGetUserById({ userId: userId ?? "" });
  const updateStatus = useUserUpdateStatus();
  const updateRole = useUserUpdateRole();
  if (!userId)
    return (
      <ErrorState
        title="Usuario no encontrado"
        message="No se indicó un usuario válido."
      />
    );
  if (query.isLoading) return <LoadingState message="Cargando perfil..." />;
  if (query.isError || !query.data)
    return (
      <ErrorState title="No se pudo cargar el perfil" onRetry={query.refetch} />
    );
  const user = query.data;
  const currentRole = user.role as UserRole;
  const currentStatus = user.status as UserStatus;
  const refresh = () => query.refetch();
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/users" className="btn btn-ghost btn-sm gap-2">
        <ArrowLeft size={16} /> Volver a usuarios
      </Link>
      <section className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
        <div className="bg-primary px-6 py-8 text-primary-content sm:px-8">
          <div className="flex items-center gap-4">
            <div className="grid size-20 place-items-center rounded-3xl bg-primary-content text-2xl font-bold text-primary">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {user.firstName} {user.lastName}
              </h1>
              <p className="mt-1 text-sm text-primary-content/75">
                {user.email ?? "Sin correo registrado"}
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-8">
          <Info icon={IdCard} label="DNI" value={user.dni} />
          <Info
            icon={Phone}
            label="Teléfono"
            value={user.phone || "No registrado"}
          />
          <Info
            icon={Mail}
            label="Correo"
            value={user.email ?? "No registrado"}
          />
          <Info
            icon={ShieldCheck}
            label="Rol"
            value={roleLabels[currentRole] ?? user.role}
          />
          <Info
            icon={CheckCircle2}
            label="Estado"
            value={statusLabels[currentStatus] ?? user.status}
          />
          <Info
            icon={CalendarDays}
            label="Registrado"
            value={formatDate(user.createdAt)}
          />
        </div>
      </section>
      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-8">
        <h2 className="text-lg font-bold">Administrar acceso</h2>
        <p className="mt-1 text-sm text-base-content/55">
          Cambia el rol o el estado del usuario.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="form-control">
            <span className="label font-semibold">Rol</span>
            <select
              className="select select-bordered"
              value={currentRole}
              disabled={updateRole.isPending}
              onChange={(event) => {
                updateRole.mutate(
                  { userId, role: event.target.value as UserRole },
                  { onSuccess: refresh },
                );
              }}
            >
              {Object.entries(roleLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control">
            <span className="label font-semibold">Estado</span>
            <select
              className="select select-bordered"
              value={currentStatus}
              disabled={updateStatus.isPending}
              onChange={(event) => {
                updateStatus.mutate(
                  { userId, status: event.target.value as UserStatus },
                  { onSuccess: refresh },
                );
              }}
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {(updateRole.isError || updateStatus.isError) && (
          <div className="alert alert-error mt-4">
            No se pudo actualizar el acceso.
          </div>
        )}
      </section>
    </div>
  );
};

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-base-300 p-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-base-content/45">
          {label}
        </p>
        <p className="mt-1 text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default UsersDeatilsPage;
