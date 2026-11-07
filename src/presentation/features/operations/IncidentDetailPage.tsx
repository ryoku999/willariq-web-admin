import { enumLabel } from "@/shared/utils/enum-labels";
import { roleBase } from "@/shared/utils/operations-path";
import { lazy, Suspense, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  categories,
  sentiments,
  types,
  urgencies,
  type Assignment,
  type IncidentAction,
  type IncidentDetail,
} from "@/core/entities/operations.entity";
import {
  useAssignmentsForIncident,
  useIncidentJobs,
  useEvidenceDownload,
  useIncident,
  useIncidentRecords,
  useOperationMutation,
  useSummary,
} from "@/infrastructure/hooks/use-operations";
import {
  useAreas,
  useAreaMembers,
} from "@/infrastructure/hooks/use-municipal-areas";
import { useUserProfile } from "@/infrastructure/hooks/use-users";
import { useAuthStore } from "@/infrastructure/storage/auth-storage";
import {
  Dialog,
  Field,
  Pager,
  PanelPage,
  PanelTable,
  QueryView,
} from "@/presentation/components/PanelControls";
import {
  downloadBlob,
  errorMessage,
  formatDate,
} from "@/shared/utils/panel-format";

const IncidentMap = lazy(() => import("./IncidentMap"));
const labels = {
  review: "Guardar revisión",
  accept: "Aceptar incidencia",
  reject: "Rechazar incidencia",
  assignments: "Asignar",
  reassignments: "Reasignar",
  start: "Iniciar atención",
  resolve: "Resolver",
  close: "Cerrar incidencia",
  cancel: "Cancelar incidencia",
  "ai/retry": "Reintentar IA",
  "assignment-accept": "Aceptar asignación",
  "assignment-cancel": "Cancelar asignación",
} as const;
type Action = keyof typeof labels;
const activeStatuses = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"];

function WorkflowDialog({
  action,
  incident,
  assignment,
  managerOnly,
  onClose,
}: {
  action: Action;
  incident: IncidentDetail;
  assignment?: Assignment;
  managerOnly: boolean;
  onClose: () => void;
}) {
  const mutation = useOperationMutation();
  const [area, setArea] = useState(
    action === "reassignments" ? (assignment?.areaId ?? "") : "",
  );
  const assigning = action === "assignments" || action === "reassignments";
  const areas = useAreas(1, undefined, "ACTIVE", 100);
  const members = useAreaMembers(assigning ? area : "", 1, true, 100);
  const [version] = useState({ expectedVersion: incident.version });
  const [assignmentVersion] = useState(() =>
    assignment
      ? {
          assignmentId: assignment.id,
          expectedAssignmentVersion: assignment.version,
        }
      : {},
  );
  const stale =
    incident.version !== version.expectedVersion ||
    assignment?.version !== assignmentVersion.expectedAssignmentVersion;
  const needsReason = [
    "review",
    "reject",
    "reassignments",
    "cancel",
    "assignment-cancel",
  ].includes(action);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const text = (key: string) => String(fields.get(key) ?? "").trim();
    let body: Record<string, unknown> = { ...version };
    if (needsReason) body.reason = text("reason");
    if (action === "review")
      body = {
        ...body,
        improvedDescription: text("improvedDescription"),
        recommendedAction: text("recommendedAction"),
        type: text("type"),
        category: text("category"),
        urgency: text("urgency"),
        sentiment: text("sentiment"),
        requiresSupervision: fields.has("requiresSupervision"),
        keywords: [
          ...new Set(
            text("keywords")
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
          ),
        ].slice(0, 10),
        entities: (incident.entities ?? []).map((x) => ({
          ...x,
          confidence: Number(x.confidence ?? 0),
        })),
      };
    if (action === "reject") body.rejectionReason = text("rejectionReason");
    if (assigning)
      body = {
        ...body,
        areaId: area,
        operatorId: text("operatorId") || undefined,
        note: text("note") || undefined,
      };
    if (
      [
        "reassignments",
        "start",
        "resolve",
        "assignment-accept",
        "assignment-cancel",
      ].includes(action)
    )
      body = { ...body, ...assignmentVersion };
    if (action === "resolve")
      body.resolutionSummary = text("resolutionSummary");
    if (action === "assignment-accept" || action === "assignment-cancel") {
      if (assignment)
        mutation.mutate(
          {
            type: "assignment",
            args: [
              assignment.id,
              action === "assignment-accept" ? "accept" : "cancel",
              body,
            ],
          },
          { onSuccess: onClose },
        );
    } else
      mutation.mutate(
        {
          type: "incident",
          args: [incident.id, action as IncidentAction, body],
        },
        { onSuccess: onClose },
      );
  }
  return (
    <Dialog title={labels[action]} onClose={onClose} busy={mutation.isPending}>
      <form onSubmit={submit} className="grid gap-3">
        {action === "review" && (
          <>
            <Field label="Descripción revisada">
              <textarea
                name="improvedDescription"
                className="textarea w-full"
                required
                maxLength={10000}
                defaultValue={
                  incident.improvedDescription ?? incident.originalMessage
                }
              />
            </Field>
            <Field label="Acción recomendada">
              <textarea
                name="recommendedAction"
                className="textarea w-full"
                required
                maxLength={5000}
                defaultValue={incident.recommendedAction ?? ""}
              />
            </Field>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["Tipo", "type", types],
                  ["Categoría", "category", categories],
                  ["Urgencia", "urgency", urgencies],
                  ["Sentimiento", "sentiment", sentiments],
                ] as const
              ).map(([label, name, options]) => (
                <Field key={name} label={label}>
                  <select
                    className="select w-full"
                    name={name}
                    required
                    defaultValue={incident[name] ?? ""}
                  >
                    <option value="">Seleccionar</option>
                    {options.map((item) => (
                      <option key={item} value={item}>
                        {enumLabel(item)}
                      </option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
            <Field label="Palabras clave separadas por comas">
              <input
                className="input w-full"
                name="keywords"
                defaultValue={incident.keywords.join(", ")}
                maxLength={800}
              />
            </Field>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                name="requiresSupervision"
                defaultChecked={incident.requiresSupervision}
              />{" "}
              Requiere supervisión
            </label>
          </>
        )}
        {assigning && (
          <>
            <Field label="Área responsable">
              <select
                value={area}
                disabled={managerOnly || areas.isPending}
                required
                className="select w-full"
                onChange={(e) => setArea(e.target.value)}
              >
                <option value="">Seleccionar área</option>
                {areas.data?.items.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.name}
                  </option>
                ))}
                {area && !areas.data?.items.some((row) => row.id === area) && (
                  <option value={area}>{area}</option>
                )}
              </select>
            </Field>
            <Field label="Responsable">
              <select
                key={area}
                className="select w-full"
                name="operatorId"
                disabled={!area || members.isPending}
              >
                <option value="">Dejar solo en el área</option>
                {members.data?.items
                  .filter(
                    (x) =>
                      x.user.status === "ACTIVE" &&
                      ["OPERATOR", "SUPERVISOR"].includes(x.user.role),
                  )
                  .map((x) => (
                    <option key={x.id} value={x.userId}>
                      {x.user.firstName} {x.user.lastName}
                    </option>
                  ))}
              </select>
            </Field>
            {(areas.error || members.error) && (
              <p role="alert" className="text-error">
                {errorMessage(areas.error ?? members.error)}
              </p>
            )}
            <Field label="Nota opcional">
              <textarea
                className="textarea w-full"
                name="note"
                maxLength={1000}
              />
            </Field>
          </>
        )}
        {action === "reject" && (
          <Field label="Motivo de rechazo">
            <input
              className="input w-full"
              name="rejectionReason"
              required
              maxLength={80}
            />
          </Field>
        )}
        {needsReason && (
          <Field label="Justificación">
            <textarea
              className="textarea w-full"
              name="reason"
              required
              maxLength={1000}
            />
          </Field>
        )}
        {action === "resolve" && (
          <Field label="Resumen de resolución">
            <textarea
              className="textarea w-full"
              name="resolutionSummary"
              required
              maxLength={5000}
            />
          </Field>
        )}
        {!needsReason && !assigning && action !== "resolve" && (
          <p>Confirma la acción para {incident.trackingCode}.</p>
        )}
        {stale && (
          <p className="alert alert-warning">
            La incidencia cambió. Cierra y abre nuevamente esta acción.
          </p>
        )}
        {mutation.error && (
          <p role="alert" className="alert alert-error">
            {errorMessage(mutation.error)}
          </p>
        )}
        <button
          className="btn btn-primary justify-self-end"
          disabled={
            mutation.isPending ||
            stale ||
            (assigning && (!area || !!areas.error || !!members.error))
          }
        >
          {mutation.isPending ? "Guardando…" : labels[action]}
        </button>
      </form>
    </Dialog>
  );
}

function IncidentBody({ incident }: { incident: IncidentDetail }) {
  const user = useAuthStore((s) => s.user);
  const summary = useSummary();
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<
    "history" | "assignments" | "evidence" | "jobs"
  >("history");
  const [action, setAction] = useState<Action | null>(null);
  const [map, setMap] = useState(false);
  const records = useIncidentRecords(incident.id, { page, limit: 20 }, mode);
  const currentAssignments = useAssignmentsForIncident(incident.id, {
    page: 1,
    limit: 20,
  });
  const latestJobs = useIncidentJobs(
    incident.id,
    { page: 1, limit: 20 },
    incident.status === "IN_REVIEW" || incident.status === "AI_ANALYSIS",
  );
  const active = currentAssignments.data?.items.find((row) =>
    activeStatuses.includes(row.status),
  );
  const operation = useOperationMutation();
  const download = useEvidenceDownload();
  const global = user?.role === "ADMIN" || user?.role === "SUPERVISOR";
  const manager =
    !!active &&
    !!summary.data?.managedAreaIds.includes(active.areaId) &&
    !incident.requiresSupervision;
  const profile = useUserProfile();
  const own = !!profile.data && active?.operatorId === profile.data.id;
  const actions: Action[] = [];
  if (global && incident.status === "IN_REVIEW")
    actions.push("review", "accept", "reject");
  if (global && incident.status === "ACCEPTED") actions.push("assignments");
  if (active && (global || manager))
    actions.push("reassignments", "assignment-cancel");
  if (own && active?.status === "ASSIGNED") actions.push("assignment-accept");
  if (own && active?.status === "ACCEPTED") actions.push("start");
  if (own && active?.status === "IN_PROGRESS") actions.push("resolve");
  if (global && incident.status === "RESOLVED") actions.push("close");
  if (
    global &&
    ["RECEIVED", "AI_ANALYSIS", "IN_REVIEW", "ACCEPTED"].includes(
      incident.status,
    )
  )
    actions.push("cancel");
  if (
    (global || manager) &&
    incident.status === "IN_REVIEW" &&
    latestJobs.data?.items[0]?.status === "FAILED"
  )
    actions.push("ai/retry");
  const base = roleBase(user?.role);
  return (
    <PanelPage
      title={incident.trackingCode}
      description={`${enumLabel(incident.status)} · versión ${incident.version}`}
    >
      <Link className="link" to={`${base}/incidents`}>
        Volver a incidencias
      </Link>
      <section className="space-y-3 rounded-xl border border-base-300 bg-base-100 p-4">
        <h2 className="font-bold">Reporte</h2>
        <p className="whitespace-pre-wrap">{incident.originalMessage}</p>
        {incident.improvedDescription && (
          <p>
            <strong>Revisión:</strong> {incident.improvedDescription}
          </p>
        )}
        {incident.recommendedAction && (
          <p>
            <strong>Acción recomendada:</strong> {incident.recommendedAction}
          </p>
        )}
        {incident.resolutionSummary && (
          <p>
            <strong>Resolución:</strong> {incident.resolutionSummary}
          </p>
        )}
        {incident.rejectionReason && (
          <p>
            <strong>Rechazo:</strong> {incident.rejectionReason} ·{" "}
            {incident.rejectionComment}
          </p>
        )}
        <p>
          {incident.address ?? "Sin dirección registrada"} · {incident.latitude}
          , {incident.longitude}
        </p>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setMap(!map)}
        >
          {map ? "Ocultar ubicación" : "Ver ubicación"}
        </button>
        {map && (
          <Suspense fallback={<p>Cargando mapa…</p>}>
            <IncidentMap items={[incident]} base={base} />
          </Suspense>
        )}
      </section>
      {currentAssignments.error && (
        <p className="alert alert-error">
          {errorMessage(currentAssignments.error)}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {actions.map((x) => (
          <button
            type="button"
            key={x}
            className="btn btn-primary"
            onClick={() => setAction(x)}
          >
            {labels[x]}
          </button>
        ))}
      </div>
      <div
        className="flex flex-wrap gap-2"
        aria-label="Registros de la incidencia"
      >
        {(["history", "assignments", "evidence", "jobs"] as const).map(
          (x, i) => (
            <button
              type="button"
              key={x}
              aria-pressed={mode === x}
              className={`btn btn-sm ${mode === x ? "btn-primary" : ""}`}
              onClick={() => {
                setMode(x);
                setPage(1);
              }}
            >
              {["Historial", "Asignaciones", "Evidencias", "Trabajos IA"][i]}
            </button>
          ),
        )}
      </div>
      {mode === "history" && (
        <QueryView query={records.history}>
          {(data) => (
            <>
              <PanelTable headers={["Fecha", "Transición", "Comentario"]}>
                {data.items.map((x) => (
                  <tr key={x.id}>
                    <td>{formatDate(x.createdAt)}</td>
                    <td>
                      {enumLabel(x.previousStatus)} → {enumLabel(x.newStatus)}
                    </td>
                    <td>{x.comment ?? "—"}</td>
                  </tr>
                ))}
              </PanelTable>
              <Pager data={data} onPage={setPage} />
            </>
          )}
        </QueryView>
      )}
      {mode === "assignments" && (
        <QueryView query={records.assignments}>
          {(data) => (
            <>
              <PanelTable headers={["Área", "Responsable", "Estado", "Nota"]}>
                {data.items.map((x) => (
                  <tr key={x.id}>
                    <td>{x.areaId}</td>
                    <td>{x.operatorId ?? "Sin responsable"}</td>
                    <td>{enumLabel(x.status, "assignment")}</td>
                    <td>{x.note ?? "—"}</td>
                  </tr>
                ))}
              </PanelTable>
              <Pager data={data} onPage={setPage} />
            </>
          )}
        </QueryView>
      )}
      {mode === "evidence" && (
        <>
          {own && incident.status === "IN_PROGRESS" && (
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const file = new FormData(e.currentTarget).get("file");
                if (file instanceof File && file.size)
                  operation.mutate({
                    type: "evidence",
                    args: [incident.id, file],
                  });
              }}
            >
              <input
                className="file-input"
                name="file"
                type="file"
                accept="image/*"
                required
                aria-label="Evidencia de atención"
              />
              <button className="btn" disabled={operation.isPending}>
                Adjuntar evidencia
              </button>
            </form>
          )}
          {(download.error || operation.error) && (
            <p role="alert" className="alert alert-error">
              {errorMessage(download.error ?? operation.error)}
            </p>
          )}
          <QueryView query={records.evidence}>
            {(data) => (
              <>
                <PanelTable headers={["Archivo", "Estado", "Acción"]}>
                  {data.items.map((x) => (
                    <tr key={x.id}>
                      <td>{x.fileName}</td>
                      <td>{enumLabel(x.status)}</td>
                      <td>
                        <button
                          className="btn btn-sm"
                          disabled={
                            download.isPending || x.status !== "AVAILABLE"
                          }
                          onClick={() =>
                            download.mutate(
                              { id: incident.id, evidenceId: x.id },
                              {
                                onSuccess: (blob) =>
                                  downloadBlob(blob, x.fileName ?? "evidencia"),
                              },
                            )
                          }
                        >
                          Descargar
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
      {mode === "jobs" && (
        <QueryView query={records.jobs}>
          {(data) => (
            <>
              <PanelTable headers={["Trabajo", "Estado", "Error"]}>
                {data.items.map((x) => (
                  <tr key={x.id}>
                    <td>{x.id}</td>
                    <td>{enumLabel(x.status, "job")}</td>
                    <td>{enumLabel(x.errorSummary)}</td>
                  </tr>
                ))}
              </PanelTable>
              <Pager data={data} onPage={setPage} />
            </>
          )}
        </QueryView>
      )}
      {action && (
        <WorkflowDialog
          key={action}
          action={action}
          incident={incident}
          assignment={active}
          managerOnly={!global}
          onClose={() => setAction(null)}
        />
      )}
    </PanelPage>
  );
}
export default function IncidentDetailPage() {
  const { id = "" } = useParams();
  const query = useIncident(id);
  return (
    <QueryView query={query}>
      {(incident) => <IncidentBody key={incident.id} incident={incident} />}
    </QueryView>
  );
}
