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

export default function IncidentsPage() {
  const base = roleBase(useAuthStore((s) => s.user?.role));
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [urgency, setUrgency] = useState("");
  const [code, setCode] = useState("");
  const [area, setArea] = useState("");
  const [supervision, setSupervision] = useState(false);
  const [map, setMap] = useState(false);
  const [search, setSearch] = useState("");
  const query = useIncidents({
    page,
    limit: 20,
    status: status || undefined,
    urgency: urgency || undefined,
    trackingCode: search || undefined,
    areaId: area || undefined,
    requiresSupervision: supervision || undefined,
  });
  const areas = useAreas(1, undefined, undefined, 100);
  return (
    <PanelPage
      title="Incidencias"
      description="Bandeja y ubicaciones dentro del alcance de tu cuenta."
    >
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(code.trim());
          setPage(1);
        }}
      >
        <Field label="Código">
          <input
            className="input"
            value={code}
            maxLength={30}
            onChange={(e) => setCode(e.target.value)}
          />
        </Field>
        <Field label="Estado">
          <select
            className="select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos</option>
            {statuses.map((x) => (
              <option key={x} value={x}>
                {enumLabel(x)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Urgencia">
          <select
            className="select"
            value={urgency}
            onChange={(e) => {
              setUrgency(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            {urgencies.map((x) => (
              <option key={x} value={x}>
                {enumLabel(x)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Área">
          <select
            className="select"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            {areas.data?.items.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={supervision}
            onChange={(event) => {
              setSupervision(event.target.checked);
              setPage(1);
            }}
          />
          Solo requiere supervisión
        </label>
        <button className="btn btn-primary">Buscar</button>
        <button
          className="btn"
          type="button"
          aria-pressed={map}
          onClick={() => setMap(!map)}
        >
          {map ? "Ocultar mapa" : "Ver mapa"}
        </button>
      </form>
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
                    {enumLabel(row.status)}
                    {row.requiresSupervision && (
                      <span className="badge badge-warning ml-2">
                        Supervisión
                      </span>
                    )}
                  </td>
                  <td>{enumLabel(row.urgency)}</td>
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
            <PanelTable headers={["Incidencia", "Estado", "Nota"]}>
              {data.items.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link
                      className="link link-primary"
                      to={`${base}/incidents/${row.incidentId}`}
                    >
                      Ver incidencia
                    </Link>
                  </td>
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
