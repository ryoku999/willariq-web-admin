import {
  ArrowLeft,
  ClipboardList,
  MapPin,
  MessageSquare,
  Sparkles,
  UserRound,
} from "lucide-react";
import { personName } from "@/shared/utils/panel-format";
import { enumLabel } from "@/shared/utils/enum-labels";
import { roleBase } from "@/shared/utils/operations-path";
import { lazy, Suspense, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  categories,
  sentiments,
  types,
  urgencies,
  type IncidentDetail,
} from "@/core/entities/operations.entity";
import {
  useIncidentJobs,
  useIncident,
  useIncidentRecords,
  useOperationMutation,
} from "@/infrastructure/hooks/use-operations";
import { useUserProfile, useUsersList } from "@/infrastructure/hooks/use-users";
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

import { IncidentStatusBadge, IncidentUrgencyBadge } from "./IncidentBadges";
import { EvidenceGallery } from "./EvidenceGallery";

const IncidentMap = lazy(() => import("./IncidentMap"));
const labels = {
  review: "Guardar revisión",
  accept: "Aceptar incidencia",
  start: "Iniciar atención",
  transfer: "Cambiar responsable",
  close: "Cerrar incidencia",
  cancel: "Cancelar incidencia",
  "ai/retry": "Reintentar IA",
} as const;
type Action = keyof typeof labels;

function WorkflowDialog({
  action,
  incident,
  onClose,
}: {
  action: Action;
  incident: IncidentDetail;
  onClose: () => void;
}) {
  const mutation = useOperationMutation();
  const [staffSearch, setStaffSearch] = useState("");
  const staff = useUsersList(
    {
      page: 1,
      limit: 100,
      search: staffSearch.trim() || undefined,
      role: "OPERATOR",
      status: "ACTIVE",
    },
    action === "transfer",
  );
  const [version] = useState({ expectedVersion: incident.version });
  const stale = incident.version !== version.expectedVersion;
  const needsReason = ["review", "transfer", "cancel"].includes(action);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const text = (key: string) => String(fields.get(key) ?? "").trim();
    let body: Record<string, unknown> = { ...version };
    if (needsReason) body.reason = text("reason");
    if (action === "cancel")
      body.reason = [text("reasonType"), text("reason")]
        .filter(Boolean)
        .join(" · ");
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
    if (action === "transfer") body.responsibleId = text("responsibleId");
    if (action === "close") body.resolutionSummary = text("resolutionSummary");
    mutation.mutate(
      { type: "incident", args: [incident.id, action, body] },
      { onSuccess: onClose },
    );
  }
  return (
    <Dialog
      title={labels[action]}
      onClose={onClose}
      busy={mutation.isPending}
      closeLabel="Cancelar"
    >
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
        {action === "transfer" && (
          <Field label="Nuevo responsable">
            <input
              className="input w-full"
              placeholder="Buscar por nombre o DNI"
              value={staffSearch}
              onChange={(event) => setStaffSearch(event.target.value)}
            />
            <select name="responsibleId" className="select w-full" required>
              <option value="">Seleccionar operador</option>
              {staff.data?.items
                .filter((operator) => operator.id !== incident.responsibleId)
                .map((operator) => (
                  <option key={operator.id} value={operator.id}>
                    {personName(operator) || operator.dni}
                  </option>
                ))}
            </select>
            {staff.error && (
              <span role="alert">{errorMessage(staff.error)}</span>
            )}
          </Field>
        )}
        {action === "cancel" && (
          <Field label="Motivo de cancelación">
            <select name="reasonType" className="select w-full" required>
              <option value="">Seleccionar motivo</option>
              <option>Duplicado</option>
              <option>Spam o reporte falso</option>
              <option>Fuera de alcance</option>
              <option>Otro</option>
            </select>
          </Field>
        )}
        {needsReason && (
          <Field
            label={action === "cancel" ? "Detalle del motivo" : "Justificación"}
          >
            <textarea
              className="textarea w-full"
              name="reason"
              required
              maxLength={action === "cancel" ? 950 : 1000}
            />
          </Field>
        )}
        {action === "close" && (
          <Field label="Resumen de resolución">
            <textarea
              className="textarea w-full"
              name="resolutionSummary"
              defaultValue={incident.resolutionSummary ?? ""}
              required
              maxLength={5000}
            />
          </Field>
        )}
        {!needsReason && action !== "close" && (
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
          disabled={mutation.isPending || stale}
        >
          {mutation.isPending ? "Guardando…" : labels[action]}
        </button>
      </form>
    </Dialog>
  );
}

function IncidentBody({ incident }: { incident: IncidentDetail }) {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<"history" | "evidence" | "jobs">("history");
  const [action, setAction] = useState<Action | null>(null);
  const [map, setMap] = useState(false);
  const records = useIncidentRecords(incident.id, { page, limit: 20 }, mode);
  const active = ["NEW", "ACCEPTED", "IN_PROGRESS"].includes(incident.status);
  const latestJobs = useIncidentJobs(
    incident.id,
    { page: 1, limit: 20 },
    active,
  );
  const operation = useOperationMutation();
  const admin = user?.role === "ADMIN";
  const profile = useUserProfile();
  const own = !!profile.data && incident.responsibleId === profile.data.id;
  const canManage = admin || own || !incident.responsibleId;
  const actions: Action[] = [];
  if (active && canManage) actions.push("review");
  if (incident.status === "NEW") actions.push("accept");
  if (canManage && incident.status === "ACCEPTED") actions.push("start");
  if (canManage && ["IN_PROGRESS", "RESOLVED"].includes(incident.status))
    actions.push("close");
  if (active && canManage) actions.push("cancel");
  if (admin && ["ACCEPTED", "IN_PROGRESS"].includes(incident.status))
    actions.push("transfer");
  if (
    active &&
    canManage &&
    !incident.reviewedAt &&
    latestJobs.data?.items[0]?.status === "FAILED"
  )
    actions.push("ai/retry");
  const base = roleBase(user?.role);
  const source = incident.classificationSource;
  const sourceLabel =
    source === "AI"
      ? "Generada por IA"
      : source === "HUMAN"
        ? "Revisión humana"
        : "Origen sin registrar";
  const SourceIcon =
    source === "AI" ? Sparkles : source === "HUMAN" ? UserRound : ClipboardList;
  const hasClassification = Boolean(
    incident.improvedDescription ||
    incident.recommendedAction ||
    incident.category,
  );
  return (
    <PanelPage
      title={incident.trackingCode}
      description="Detalle de la incidencia"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="btn btn-ghost btn-sm" to={`${base}/incidents`}>
          <ArrowLeft size={16} aria-hidden="true" />
          Volver a incidencias
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <IncidentStatusBadge status={incident.status} />
          <IncidentUrgencyBadge urgency={incident.urgency} />
          <span className="text-xs text-base-content/60">
            Versión {incident.version}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <section className="space-y-3 rounded-2xl border border-base-300 bg-base-100 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-semibold">
                <MessageSquare size={18} aria-hidden="true" /> Reporte original
              </h2>
              <span className="badge badge-outline">Ciudadano</span>
            </div>
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {incident.originalMessage}
            </p>
          </section>

          <section className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-semibold">
                <SourceIcon size={18} aria-hidden="true" /> Clasificación
              </h2>
              {hasClassification && (
                <span
                  className={`badge ${source === "AI" ? "badge-secondary badge-soft" : source === "HUMAN" ? "badge-info badge-soft" : "badge-outline"}`}
                >
                  {sourceLabel}
                </span>
              )}
            </div>
            {hasClassification ? (
              <>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-base-content/60">Tipo</dt>
                    <dd className="font-medium">{enumLabel(incident.type)}</dd>
                  </div>
                  <div>
                    <dt className="text-base-content/60">Categoría</dt>
                    <dd className="font-medium">
                      {enumLabel(incident.category)}
                    </dd>
                  </div>
                </dl>
                {source === "HUMAN" && incident.reviewedAt && (
                  <p className="text-xs text-base-content/60">
                    Revisada el {formatDate(incident.reviewedAt)}
                  </p>
                )}
                {incident.improvedDescription && (
                  <div className="space-y-1 border-t border-base-300 pt-3">
                    <h3 className="text-sm font-semibold">
                      Descripción de la clasificación
                    </h3>
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {incident.improvedDescription}
                    </p>
                  </div>
                )}
                {incident.recommendedAction && (
                  <div className="space-y-1 rounded-xl bg-base-200 p-4">
                    <h3 className="text-sm font-semibold">
                      Acción recomendada
                    </h3>
                    <p className="whitespace-pre-wrap break-words leading-relaxed">
                      {incident.recommendedAction}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-base-content/60">
                Todavía no hay una clasificación registrada.
              </p>
            )}
          </section>

          {(incident.resolutionSummary || incident.rejectionReason) && (
            <section className="space-y-2 rounded-2xl border border-base-300 bg-base-100 p-5">
              <h2 className="font-semibold">
                {incident.resolutionSummary
                  ? "Resolución registrada"
                  : "Motivo del rechazo"}
              </h2>
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {incident.resolutionSummary ?? incident.rejectionReason}
              </p>
              {incident.rejectionComment && (
                <p className="whitespace-pre-wrap break-words text-base-content/70">
                  {incident.rejectionComment}
                </p>
              )}
            </section>
          )}
        </div>

        <section className="min-w-0 self-start space-y-3 rounded-2xl border border-base-300 bg-base-100 p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <MapPin size={18} aria-hidden="true" /> Ubicación reportada
          </h2>
          <p className="break-words">
            {incident.address ?? "Sin dirección registrada"}
          </p>
          {incident.addressReference && (
            <p className="break-words text-sm text-base-content/70">
              {incident.addressReference}
            </p>
          )}
          <p className="font-mono text-xs text-base-content/65">
            {incident.latitude}, {incident.longitude}
          </p>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            aria-expanded={map}
            onClick={() => setMap(!map)}
          >
            {map ? "Ocultar mapa" : "Ver en el mapa"}
          </button>
          {map && (
            <Suspense fallback={<p>Cargando mapa…</p>}>
              <IncidentMap items={[incident]} base={base} />
            </Suspense>
          )}
        </section>
      </div>
      <section className="rounded-xl border border-base-300 bg-base-100 p-4">
        <p>
          <strong>Responsable</strong>{" "}
          {personName(incident.responsible) || "Sin responsable"}
        </p>
        <dl className="mt-2 flex flex-wrap gap-4 text-sm">
          {(
            [
              ["Envío", incident.submittedAt],
              ["Aceptación", incident.acceptedAt],
              ["Inicio", incident.startedAt],
              ["Cierre", incident.closedAt],
            ] as const
          ).map(
            ([label, date]) =>
              date && (
                <div key={label}>
                  <dt className="font-semibold">{label}</dt>
                  <dd>{formatDate(date)}</dd>
                </div>
              ),
          )}
        </dl>
        {incident.cancellationReason && (
          <p className="mt-2">
            <strong>Motivo de cancelación</strong> {incident.cancellationReason}
          </p>
        )}
      </section>
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
        {(["history", "evidence", "jobs"] as const).map((x, i) => (
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
            {["Historial", "Evidencias", "Trabajos IA"][i]}
          </button>
        ))}
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
          {operation.error && (
            <p role="alert" className="alert alert-error">
              {errorMessage(operation.error)}
            </p>
          )}
          <QueryView query={records.evidence}>
            {(data) => (
              <>
                <EvidenceGallery incidentId={incident.id} items={data.items} />
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
              <PanelTable headers={["Fecha de solicitud", "Estado", "Error"]}>
                {data.items.map((x) => (
                  <tr key={x.id}>
                    <td>{formatDate(x.createdAt)}</td>
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
