import { IncidentStatusBadge, IncidentUrgencyBadge } from "./IncidentBadges";
import { enumLabel } from "@/shared/utils/enum-labels";
import { roleBase } from "@/shared/utils/operations-path";
import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { statuses, urgencies } from "@/core/entities/operations.entity";
import {
  useIncidents,
  useMyAssignments,
} from "@/infrastructure/hooks/use-operations";
import { useAreas } from "@/infrastructure/hooks/use-municipal-areas";
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
  area: "",
  supervision: false,
};

export default function IncidentsPage() {
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
    areaId: filters.area || undefined,
    requiresSupervision: filters.supervision || undefined,
  });
  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasFilters = activeCount > 0 || Object.values(draft).some(Boolean);
  const areas = useAreas(1, undefined, undefined, 100);
  return (
    <PanelPage
      title="Incidencias"
      description="Bandeja y ubicaciones dentro del alcance de tu cuenta."
    >
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
          <Field label="Área municipal">
            <select
              className="select w-full"
              value={draft.area}
              onChange={(event) =>
                setDraft({ ...draft, area: event.target.value })
              }
            >
              <option value="">Todas las áreas</option>
              {areas.data?.items.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
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

export function MyAssignmentsPage() {
  const base = roleBase(useAuthStore((s) => s.user?.role));
  const [page, setPage] = useState(1);
  const query = useMyAssignments({ page, limit: 20 });
  return (
    <PanelPage title="Mis asignaciones">
      <QueryView query={query}>
        {(data) => (
          <>
            <PanelTable headers={["Incidencia", "Área", "Estado", "Nota"]}>
              {data.items.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link
                      className="link link-primary"
                      to={`${base}/incidents/${row.incidentId}`}
                    >
                      {row.incident?.trackingCode ?? "Ver incidencia"}
                    </Link>
                  </td>
                  <td>{row.area?.name ?? "Área no disponible"}</td>
                  <td>{enumLabel(row.status, "assignment")}</td>
                  <td>{row.note ?? "—"}</td>
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
