import {
  ArrowRight,
  List,
  Map as MapIcon,
  MapPin,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Incident } from "@/core/entities/operations.entity";
import { urgencies } from "@/core/entities/operations.entity";
import {
  useIncidentClassification,
  useIncidents,
} from "@/infrastructure/hooks/use-operations";
import { useUserProfile } from "@/infrastructure/hooks/use-users";
import { useAuthStore } from "@/infrastructure/storage/auth-storage";
import {
  Field,
  Pager,
  PanelPage,
  QueryView,
} from "@/presentation/components/PanelControls";
import LoadingState from "@/presentation/components/LoadingState";
import { enumLabel } from "@/shared/utils/enum-labels";
import { roleBase } from "@/shared/utils/operations-path";
import { formatDate } from "@/shared/utils/panel-format";
import { IncidentStatusBadge, IncidentUrgencyBadge } from "./IncidentBadges";

const IncidentMap = lazy(() => import("./IncidentMap"));

const states = [
  ["", "Todas"],
  ["NEW", "Nuevas"],
  ["ACCEPTED", "Aceptadas"],
  ["IN_PROGRESS", "En atención"],
  ["CLOSED", "Cerradas"],
  ["CANCELLED", "Canceladas"],
  ["RESOLVED", "Resueltas"],
  ["REJECTED", "Rechazadas"],
] as const;

const emptyFilters = { code: "", urgency: "", supervision: false, mine: false };

function InboxCard({ incident, base }: { incident: Incident; base: string }) {
  const classified = !!(incident.type || incident.category || incident.urgency);
  const origin = useIncidentClassification(
    incident.id,
    incident.version,
    classified,
  );
  const isNew = incident.status === "NEW";
  const source =
    origin.data && origin.data.version === incident.version
      ? origin.data.classificationSource
      : null;
  const isAi = source === "AI";
  const isHuman = source === "HUMAN";
  const findingOrigin = origin.isPending || origin.isFetching;

  return (
    <li
      className={
        "rounded-2xl border bg-base-100 " +
        (isNew
          ? "border-primary/40 border-l-4 border-l-primary"
          : "border-base-300")
      }
    >
      <article className="grid min-w-0 gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_auto] xl:items-center">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <IncidentStatusBadge status={incident.status} />
            {incident.requiresSupervision && (
              <span className="badge badge-warning badge-soft badge-sm">
                Requiere supervisión
              </span>
            )}
          </div>
          <h3>
            <Link
              className="link link-hover font-bold [overflow-wrap:anywhere]"
              to={base + "/incidents/" + incident.id}
            >
              {incident.trackingCode}
            </Link>
          </h3>
          <div className="flex items-start gap-2 text-sm text-base-content/75">
            <MapPin className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
            <span className="min-w-0 [overflow-wrap:anywhere]">
              {incident.address || "Sin dirección registrada"}
            </span>
          </div>
        </div>

        <div className="min-w-0 rounded-xl bg-base-200/65 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium">Gravedad</span>
            <IncidentUrgencyBadge urgency={incident.urgency} />
            {isAi && (
              <span className="badge badge-secondary badge-soft badge-sm gap-1">
                <Sparkles size={12} aria-hidden="true" /> Clasificada por IA
              </span>
            )}
            {isHuman && (
              <span className="badge badge-info badge-soft badge-sm gap-1">
                <UserRound size={12} aria-hidden="true" /> Revisión humana
              </span>
            )}
            {classified && findingOrigin && !isAi && !isHuman && (
              <span className="text-xs text-base-content/70">
                Consultando origen…
              </span>
            )}
            {classified && !findingOrigin && !isAi && !isHuman && (
              <span className="text-xs text-base-content/70">
                Origen sin confirmar
              </span>
            )}
          </div>
          {incident.category && (
            <p className="mt-1 text-sm text-base-content/75 [overflow-wrap:anywhere]">
              {enumLabel(incident.category)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base-300 pt-3 xl:flex-col xl:items-end xl:border-0 xl:pt-0">
          <time
            className="text-xs text-base-content/70"
            dateTime={incident.createdAt}
          >
            {formatDate(incident.createdAt)}
          </time>
          <Link
            className="btn btn-sm btn-outline"
            to={base + "/incidents/" + incident.id}
            aria-label={"Ver detalle de " + incident.trackingCode}
          >
            Ver detalle <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </article>
    </li>
  );
}

type InboxStatus = (typeof states)[number][0];

function IncidentsInbox({
  initialStatus,
  initialUrgency,
}: {
  initialStatus: InboxStatus;
  initialUrgency: string;
}) {
  const profile = useUserProfile();
  const base = roleBase(useAuthStore((s) => s.user?.role));
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(initialStatus);
  const [draft, setDraft] = useState({
    ...emptyFilters,
    urgency: initialUrgency,
  });
  const [filters, setFilters] = useState({
    ...emptyFilters,
    urgency: initialUrgency,
  });
  const [map, setMap] = useState(false);
  const query = useIncidents({
    page,
    limit: 20,
    status: status || undefined,
    urgency: filters.urgency || undefined,
    trackingCode: filters.code || undefined,
    requiresSupervision: filters.supervision || undefined,
    responsibleId: filters.mine ? profile.data?.id : undefined,
  });
  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasFilters = activeCount > 0 || Object.values(draft).some(Boolean);

  return (
    <PanelPage
      title="Bandeja de incidencias"
      description="Consulta los reportes y abre cada caso para darle seguimiento."
    >
      <section
        className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5"
        aria-labelledby="inbox-state"
      >
        <h2 id="inbox-state" className="text-sm font-semibold">
          Estado
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {states.map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              className={
                status === value
                  ? "btn btn-sm btn-primary"
                  : "btn btn-sm btn-outline"
              }
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
            >
              {value === "NEW" && (
                <span
                  className={
                    "size-2 rounded-full " +
                    (status === value ? "bg-primary-content" : "bg-primary")
                  }
                  aria-hidden="true"
                />
              )}
              {label}
            </button>
          ))}
        </div>
        <form
          className="space-y-4 border-t border-base-300 pt-4"
          aria-label="Filtros de incidencias"
          onSubmit={(event) => {
            event.preventDefault();
            setFilters({ ...draft, code: draft.code.trim() });
            setPage(1);
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">Buscar y filtrar</h2>
            {activeCount > 0 && (
              <span className="badge badge-ghost badge-sm">
                {activeCount}{" "}
                {activeCount === 1 ? "filtro aplicado" : "filtros aplicados"}
              </span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Field label="Código de seguimiento">
              <input
                className="input w-full"
                value={draft.code}
                maxLength={30}
                placeholder="Buscar por código"
                onChange={(event) =>
                  setDraft({ ...draft, code: event.target.value })
                }
              />
            </Field>
            <Field label="Gravedad">
              <select
                className="select w-full"
                aria-label="Gravedad"
                value={draft.urgency}
                onChange={(event) =>
                  setDraft({ ...draft, urgency: event.target.value })
                }
              >
                <option value="">Todas las gravedades</option>
                {[...urgencies].reverse().map((urgency) => (
                  <option key={urgency} value={urgency}>
                    {enumLabel(urgency)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={draft.mine}
                  disabled={!profile.data}
                  onChange={(event) =>
                    setDraft({ ...draft, mine: event.target.checked })
                  }
                />
                Solo a mi cargo
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={draft.supervision}
                  onChange={(event) =>
                    setDraft({ ...draft, supervision: event.target.checked })
                  }
                />
                Requieren supervisión
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn btn-sm btn-ghost"
                type="button"
                disabled={!hasFilters}
                onClick={() => {
                  setDraft(emptyFilters);
                  setFilters(emptyFilters);
                  setPage(1);
                }}
              >
                Limpiar filtros
              </button>
              <button className="btn btn-sm btn-primary" type="submit">
                <Search size={16} aria-hidden="true" /> Aplicar filtros
              </button>
            </div>
          </div>
        </form>
      </section>

      <section aria-labelledby="inbox-results" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="inbox-results" className="text-lg font-bold">
              {states.find(([value]) => value === status)?.[1] ?? "Resultados"}
            </h2>
            {query.data && (
              <p className="text-sm text-base-content/70">
                {query.data.pagination.total}{" "}
                {query.data.pagination.total === 1
                  ? "incidencia"
                  : "incidencias"}
              </p>
            )}
          </div>
          <div className="join" aria-label="Vista de resultados">
            <button
              className={"btn btn-sm join-item " + (!map ? "btn-primary" : "")}
              type="button"
              aria-pressed={!map}
              onClick={() => setMap(false)}
            >
              <List size={16} aria-hidden="true" /> Lista
            </button>
            <button
              className={"btn btn-sm join-item " + (map ? "btn-primary" : "")}
              type="button"
              aria-pressed={map}
              onClick={() => setMap(true)}
            >
              <MapIcon size={16} aria-hidden="true" /> Mapa
            </button>
          </div>
        </div>
        <QueryView query={query}>
          {(data) =>
            data.items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-sm text-base-content/75">
                {status === "NEW" && !activeCount
                  ? "Por ahora no hay incidencias nuevas."
                  : "No hay incidencias para esta selección."}
              </p>
            ) : (
              <>
                {map ? (
                  <div className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4">
                    <p className="text-sm text-base-content/70">
                      Ubicaciones de los reportes de esta página.
                    </p>
                    <Suspense fallback={<LoadingState />}>
                      <IncidentMap items={data.items} base={base} />
                    </Suspense>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {data.items.map((incident) => (
                      <InboxCard
                        key={incident.id}
                        incident={incident}
                        base={base}
                      />
                    ))}
                  </ul>
                )}
              </>
            )
          }
        </QueryView>
        {query.data && query.data.pagination.pages > 1 && (
          <Pager data={query.data} onPage={setPage} />
        )}
      </section>
    </PanelPage>
  );
}

export default function IncidentsPage() {
  const [params] = useSearchParams();
  const status =
    states.find(([value]) => value === params.get("status"))?.[0] ?? "";
  const urgency =
    urgencies.find((value) => value === params.get("urgency")) ?? "";
  return (
    <IncidentsInbox
      key={status + ":" + urgency}
      initialStatus={status}
      initialUrgency={urgency}
    />
  );
}
