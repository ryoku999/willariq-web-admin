import { IncidentStatusBadge, IncidentUrgencyBadge } from "./IncidentBadges";
import { enumLabel } from "@/shared/utils/enum-labels";
import { roleBase } from "@/shared/utils/operations-path";
import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { statuses, urgencies } from "@/core/entities/operations.entity";
import { useIncidents } from "@/infrastructure/hooks/use-operations";
import { useUserProfile } from "@/infrastructure/hooks/use-users";
import { useAuthStore } from "@/infrastructure/storage/auth-storage";
import {
  Field,
  Pager,
  PanelPage,
  PanelTable,
  QueryView,
} from "@/presentation/components/PanelControls";
import { formatDate } from "@/shared/utils/panel-format";
import LoadingState from "@/presentation/components/LoadingState";

const IncidentMap = lazy(() => import("./IncidentMap"));

const emptyFilters = {
  code: "",
  status: "",
  urgency: "",
  supervision: false,
  mine: false,
};

export default function IncidentsPage() {
  const profile = useUserProfile();
  const base = roleBase(useAuthStore((s) => s.user?.role));
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [map, setMap] = useState(false);
  const query = useIncidents({
    page,
    limit: 20,
    status: filters.status || undefined,
    urgency: filters.urgency || undefined,
    trackingCode: filters.code || undefined,
    requiresSupervision: filters.supervision || undefined,
    responsibleId: filters.mine ? profile.data?.id : undefined,
  });
  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasFilters = activeCount > 0 || Object.values(draft).some(Boolean);
  return (
    <PanelPage
      title="Incidencias"
      description="Bandeja y ubicaciones dentro del alcance de tu cuenta."
    >
      <div
        className="flex flex-wrap gap-2"
        aria-label="Accesos rápidos a la bandeja"
      >
        {(
          [
            ["", "Todas"],
            ["NEW", "Nuevas"],
            ["ACCEPTED", "Aceptadas"],
            ["IN_PROGRESS", "En atención"],
            ["CLOSED", "Cerradas"],
            ["CANCELLED", "Canceladas"],
          ] as const
        ).map(([status, label]) => (
          <button
            key={status}
            type="button"
            aria-pressed={filters.status === status}
            className={
              filters.status === status
                ? "btn btn-sm btn-primary"
                : "btn btn-sm"
            }
            onClick={() => {
              setDraft({ ...filters, status });
              setFilters({ ...filters, status });
              setPage(1);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <form
        className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5"
        aria-label="Filtros de incidencias"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...draft, code: draft.code.trim() });
          setPage(1);
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold">Filtros de incidencias</h2>
          {activeCount > 0 && (
            <span className="badge badge-ghost">
              {activeCount}{" "}
              {activeCount === 1 ? "filtro aplicado" : "filtros aplicados"}
            </span>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
          <Field label="Estado">
            <select
              className="select w-full"
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value })
              }
            >
              <option value="">Todos los estados</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {enumLabel(status)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Urgencia">
            <select
              className="select w-full"
              value={draft.urgency}
              onChange={(event) =>
                setDraft({ ...draft, urgency: event.target.value })
              }
            >
              <option value="">Todas las urgencias</option>
              {urgencies.map((urgency) => (
                <option key={urgency} value={urgency}>
                  {enumLabel(urgency)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={draft.supervision}
              onChange={(event) =>
                setDraft({ ...draft, supervision: event.target.checked })
              }
            />
            Solo incidencias que requieren supervisión
          </label>
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
          <div className="flex gap-2">
            <button
              className="btn btn-ghost"
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
            <button className="btn btn-primary" type="submit">
              Aplicar filtros
            </button>
          </div>
        </div>
      </form>
      <div className="flex justify-end">
        <button
          className="btn"
          type="button"
          aria-pressed={map}
          onClick={() => setMap((current) => !current)}
        >
          {map ? "Ocultar mapa" : "Ver mapa"}
        </button>
      </div>
      <QueryView query={query}>
        {(data) => (
          <>
            {map && (
              <>
                <p className="text-sm">
                  El mapa muestra los resultados de esta página.
                </p>
                <Suspense fallback={<LoadingState />}>
                  <IncidentMap items={data.items} base={base} />
                </Suspense>
              </>
            )}
            <PanelTable
              headers={[
                "Código",
                "Estado",
                "Urgencia",
                "Dirección",
                "Registro",
              ]}
            >
              {data.items.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link
                      className="link link-primary"
                      to={`${base}/incidents/${row.id}`}
                    >
                      {row.trackingCode}
                    </Link>
                  </td>
                  <td>
                    <IncidentStatusBadge status={row.status} />
                    {row.requiresSupervision && (
                      <span className="badge badge-warning ml-2">
                        Supervisión
                      </span>
                    )}
                  </td>
                  <td>
                    <IncidentUrgencyBadge urgency={row.urgency} />
                  </td>
                  <td>{row.address ?? "—"}</td>
                  <td>{formatDate(row.createdAt)}</td>
                </tr>
              ))}
            </PanelTable>
            <Pager data={data} onPage={setPage} />
          </>
        )}
      </QueryView>
    </PanelPage>
  );
}
