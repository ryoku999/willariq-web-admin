import { useUserProfile } from "@/infrastructure/hooks/use-users";
import ErrorState from "@/presentation/components/ErrorState";
import LoadingState from "@/presentation/components/LoadingState";
import UpdateProfileForm from "../components/UpdateProfileForm";
import {
  AtSign,
  CalendarDays,
  CheckCircle2,
  IdCard,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const roleLabels = {
  ADMIN: "Administrador",
  SUPERVISOR: "Supervisor",
  OPERATOR: "Operador",
} as const;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
  }).format(new Date(value));

const DetailItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-4 rounded-2xl border border-base-300 bg-base-100 p-4">
    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
      <Icon size={19} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-base-content/45">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-base-content">
        {value}
      </p>
    </div>
  </div>
);

const ProfilePage = () => {
  const { data: user, refetch, isError, isLoading } = useUserProfile();

  if (isLoading) {
    return <LoadingState message="Cargando tu perfil..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Error al cargar los datos del perfil"
        title="Error"
        onRetry={refetch}
      />
    );
  }

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`;
  const isActive = user.status.toLowerCase() === "active";

  return (
    <div className="mx-auto max-w-5xl space-y-6 ">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Cuenta personal
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Mi perfil</h1>
        <p className="mt-2 text-sm text-base-content/60">
          Consulta la información asociada a tu cuenta de Willariq.
        </p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
        <div className="bg-primary px-6 py-8 text-primary-content sm:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid size-20 shrink-0 place-items-center rounded-3xl bg-primary-content text-2xl font-bold uppercase text-primary shadow-lg">
                {initials}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <p className="mt-1 text-sm text-primary-content/75">
                  {user.email ?? "Sin correo registrado"}
                </p>
              </div>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full bg-primary-content/15 px-3 py-2 text-sm font-semibold">
              <ShieldCheck size={17} />
              {roleLabels[user.role]}
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-8">
          <DetailItem icon={IdCard} label="DNI" value={user.dni} />
          <DetailItem
            icon={Phone}
            label="Teléfono"
            value={user.phone || "No registrado"}
          />
          <DetailItem
            icon={Mail}
            label="Correo electrónico"
            value={user.email ?? "No registrado"}
          />
          <DetailItem
            icon={AtSign}
            label="Rol de acceso"
            value={roleLabels[user.role]}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Estado de la cuenta</h2>
            <p className="mt-1 text-sm text-base-content/55">
              Información de actividad y registro.
            </p>
          </div>
          <span
            className={`badge gap-1.5 px-3 py-3 font-semibold ${isActive ? "badge-success" : "badge-ghost"}`}
          >
            <CheckCircle2 size={14} />
            {isActive ? "Activa" : user.status}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem
            icon={CalendarDays}
            label="Cuenta creada"
            value={formatDate(user.createdAt)}
          />
          <DetailItem
            icon={CalendarDays}
            label="Última actualización"
            value={formatDate(user.updatedAt)}
          />
        </div>
      </section>

      <UpdateProfileForm user={user} />
    </div>
  );
};

export default ProfilePage;
