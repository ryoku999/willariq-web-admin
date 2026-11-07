import { enumLabel, localizeEnumFields } from "@/shared/utils/enum-labels";
import { roleBase } from "@/shared/utils/operations-path";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useAdminAction,
  useAdminJob,
  useAdminJobs,
  useAudit,
  useAuditEntry,
  useOutbox,
} from "@/infrastructure/hooks/use-administration";
import { useAuthStore } from "@/infrastructure/storage/auth-storage";
import {
  Dialog,
  Field,
  Pager,
  PanelPage,
  PanelTable,
  QueryView,
} from "@/presentation/components/PanelControls";
import { errorMessage, formatDate } from "@/shared/utils/panel-format";

export function MonitoringPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";
  const base = roleBase(user?.role);
  const [page, setPage] = useState(1);
  const [outPage, setOutPage] = useState(1);
  const [mode, setMode] = useState<"jobs" | "outbox">("jobs");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState("");
  const jobs = useAdminJobs(page);
  const outbox = useOutbox(
    outPage,
    status || undefined,
    isAdmin && mode === "outbox",
  );
  const detail = useAdminJob(selected);
  const retry = useAdminAction("retryOutbox");
  return (
    <PanelPage
      title="Trabajos de clasificación"
      description="Estado de ejecución, intentos de proveedor y despacho a la cola."
    >
      {isAdmin && (
        <div className="flex gap-2">
          <button
            className="btn"
            aria-pressed={mode === "jobs"}
            onClick={() => setMode("jobs")}
          >
            Trabajos
          </button>
          <button
            className="btn"
            aria-pressed={mode === "outbox"}
            onClick={() => setMode("outbox")}
          >
            Outbox
          </button>
        </div>
      )}
      {mode === "jobs" && (
        <>
          <button className="btn btn-sm" onClick={() => void jobs.refetch()}>
            Actualizar
          </button>
          <QueryView query={jobs}>
            {(data) => (
              <>
                <PanelTable
                  headers={[
                    "Fecha",
                    "Trabajo",
                    "Estado",
                    "Incidencia",
                    "Acción",
                  ]}
                >
                  {data.items.map((x) => (
                    <tr key={x.id}>
                      <td>{formatDate(x.createdAt)}</td>
                      <td>{x.id}</td>
                      <td>{enumLabel(x.status, "job")}</td>
                      <td>
                        {x.incidentId && (
                          <Link
                            className="link"
                            to={`${base}/incidents/${x.incidentId}`}
                          >
                            Ver incidencia
                          </Link>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={() => setSelected(x.id)}
                        >
                          Ver intentos
                        </button>
                      </td>
                    </tr>
                  ))}
                </PanelTable>
                <Pager data={data} onPage={setPage} />
              </>
            )}
          </QueryView>
        </>
      )}
      {isAdmin && mode === "outbox" && (
        <>
          <div className="flex items-end gap-2">
            <Field label="Estado">
              <select
                className="select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setOutPage(1);
                }}
              >
                <option value="">Todos</option>
                {["PENDING", "PROCESSING", "PUBLISHED", "DEAD"].map((x) => (
                  <option key={x} value={x}>
                    {enumLabel(x)}
                  </option>
                ))}
              </select>
            </Field>
            <button className="btn" onClick={() => void outbox.refetch()}>
              Actualizar
            </button>
          </div>
          {retry.error && (
            <p className="alert alert-error" role="alert">
              {errorMessage(retry.error)}
            </p>
          )}
          <QueryView query={outbox}>
            {(data) => (
              <>
                <PanelTable
                  headers={["Trabajo", "Estado", "Intentos", "Error", "Acción"]}
                >
                  {data.items.map((x) => (
                    <tr key={x.id}>
                      <td>{x.aggregateId}</td>
                      <td>{enumLabel(x.status, "job")}</td>
                      <td>{x.attempts}</td>
                      <td>{enumLabel(x.lastError)}</td>
                      <td>
                        {x.status === "DEAD" && (
                          <button
                            className="btn btn-sm"
                            disabled={retry.isPending}
                            onClick={() => retry.mutate([x.id])}
                          >
                            Reintentar despacho
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </PanelTable>
                <Pager data={data} onPage={setOutPage} />
              </>
            )}
          </QueryView>
        </>
      )}
      {selected && (
        <Dialog title="Detalle del trabajo" onClose={() => setSelected("")}>
          <QueryView query={detail}>
            {(job) => (
              <>
                <p>
                  {enumLabel(job.status, "job")} ·{" "}
                  {job.finalModel ?? "Sin modelo final"}
                </p>
                {job.errorSummary && <p>{enumLabel(job.errorSummary)}</p>}
                <PanelTable
                  headers={[
                    "Proveedor",
                    "Modelo",
                    "Estado",
                    "Error",
                    "Latencia",
                  ]}
                >
                  {job.attempts?.map((x) => (
                    <tr key={x.id}>
                      <td>{x.provider}</td>
                      <td>{x.model}</td>
                      <td>{enumLabel(x.status, "job")}</td>
                      <td>{enumLabel(x.errorCode)}</td>
                      <td>{x.latencyMs ?? "—"}</td>
                    </tr>
                  ))}
                </PanelTable>
              </>
            )}
          </QueryView>
        </Dialog>
      )}
    </PanelPage>
  );
}

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState("");
  const query = useAudit({ page, limit: 20, ...filters });
  const detail = useAuditEntry(selected);
  return (
    <PanelPage
      title="Auditoría"
      description="Consulta los cambios registrados y su actor."
    >
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const get = (key: string) =>
            String(f.get(key) ?? "").trim() || undefined;
          const from = get("from");
          const to = get("to");
          setFilters({
            action: get("action"),
            entityType: get("entityType"),
            entityId: get("entityId"),
            actorId: get("actorId"),
            from: from ? `${from}T00:00:00-05:00` : undefined,
            to: to ? `${to}T23:59:59.999-05:00` : undefined,
          });
          setPage(1);
        }}
      >
        {(
          [
            ["Acción", "action"],
            ["Entidad", "entityType"],
            ["ID de entidad", "entityId"],
            ["UUID del actor", "actorId"],
          ] as const
        ).map(([label, name]) => (
          <Field key={name} label={label}>
            <input className="input" name={name} maxLength={120} />
          </Field>
        ))}
        <Field label="Desde (Lima)">
          <input className="input" type="date" name="from" />
        </Field>
        <Field label="Hasta (Lima)">
          <input className="input" type="date" name="to" />
        </Field>
        <button className="btn btn-primary">Filtrar</button>
        <button
          className="btn"
          type="reset"
          onClick={() => {
            setFilters({});
            setPage(1);
          }}
        >
          Limpiar
        </button>
      </form>
      <QueryView query={query}>
        {(data) => (
          <>
            <PanelTable
              headers={["Fecha", "Acción", "Entidad", "Actor", "Detalle"]}
            >
              {data.items.map((x) => (
                <tr key={x.id}>
                  <td>{formatDate(x.createdAt)}</td>
                  <td>{enumLabel(x.action)}</td>
                  <td>
                    {enumLabel(x.entityType)} · {x.entityId}
                  </td>
                  <td>{x.userId ?? "Sistema"}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => setSelected(x.id)}
                    >
                      Ver cambios
                    </button>
                  </td>
                </tr>
              ))}
            </PanelTable>
            <Pager data={data} onPage={setPage} />
          </>
        )}
      </QueryView>
      {selected && (
        <Dialog title="Cambios de auditoría" onClose={() => setSelected("")}>
          <QueryView query={detail}>
            {(x) => (
              <>
                <p>
                  {enumLabel(x.action)} · {formatDate(x.createdAt)}
                </p>
                <pre className="max-h-96 overflow-auto rounded bg-base-200 p-3">
                  {JSON.stringify(
                    localizeEnumFields({
                      anterior: x.oldValue,
                      actual: x.newValue,
                    }),
                    null,
                    2,
                  )}
                </pre>
              </>
            )}
          </QueryView>
        </Dialog>
      )}
    </PanelPage>
  );
}
