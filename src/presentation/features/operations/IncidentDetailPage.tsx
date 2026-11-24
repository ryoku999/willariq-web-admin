import {
  ArrowLeft,
  ClipboardList,
  MapPin,
  Maximize2,
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
  if (incident.status === "NEW") actions.push("accept");
  if (canManage && incident.status === "ACCEPTED") actions.push("start");
  if (canManage && ["IN_PROGRESS", "RESOLVED"].includes(incident.status))
    actions.push("close");
  if (active && canManage) actions.push("review", "cancel");
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
  const ai = source === "AI";
  const SourceIcon = ai
    ? Sparkles
    : source === "HUMAN"
      ? UserRound
      : ClipboardList;
  const hasClassification = Boolean(
    incident.type ||
    incident.category ||
    incident.urgency ||
    incident.improvedDescription ||
    incident.recommendedAction,
  );
  const sourceLabel = ai
    ? "Generado por IA"
    : source === "HUMAN"
      ? "Revisión humana"
      : source === "MANUAL_WITHOUT_AI"
        ? "Revisión manual pendiente"
        : hasClassification
          ? "Origen sin registrar"
          : "Sin clasificar";
  const jobStatus = latestJobs.data?.items[0]?.status;
  const analyzing = ["PENDING", "QUEUED", "PROCESSING"].includes(
    jobStatus ?? "",
  );
  const reporter = personName(incident.reporter);
  const reportedAt = incident.submittedAt ?? incident.createdAt;
  const hasCoordinates =
    Number.isFinite(incident.latitude) &&
    Number.isFinite(incident.longitude) &&
    Math.abs(incident.latitude) <= 90 &&
    Math.abs(incident.longitude) <= 180;
  const coordinates = hasCoordinates
    ? incident.latitude.toFixed(6) + ", " + incident.longitude.toFixed(6)
    : null;
  const milestones = [
    ["Envío", incident.submittedAt],
    ["Aceptación", incident.acceptedAt],
    ["Inicio", incident.startedAt],
    ["Cierre", incident.closedAt],
  ] as const;
  return (
    <section className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
      <Link className="btn btn-ghost btn-sm -ml-2" to={base + "/incidents"}>
        <ArrowLeft size={16} aria-hidden="true" /> Volver a incidencias
      </Link>

      <header className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-base-content/65">
              Detalle de la incidencia
            </p>
            <h1 className="text-2xl font-bold tracking-tight [overflow-wrap:anywhere] sm:text-3xl">
              {incident.trackingCode}
            </h1>
            <p className="text-sm text-base-content/70">
              {incident.submittedAt ? "Enviada" : "Registrada"} el{" "}
              {formatDate(reportedAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-base-content/70">
              Estado operativo
            </span>
            <IncidentStatusBadge status={incident.status} />
            {hasCoordinates && (
              <a
                className="btn btn-ghost btn-sm gap-1"
                href="#reported-location"
              >
                <MapPin size={16} aria-hidden="true" /> Ver ubicación
              </a>
            )}
          </div>
        </div>
        {actions.length > 0 && (
          <div
            className="mt-5 grid grid-cols-2 gap-2 border-t border-base-300 pt-4 sm:flex sm:flex-wrap"
            aria-label="Acciones de la incidencia"
          >
            {actions.map((item) => (
              <button
                type="button"
                key={item}
                className={
                  "btn max-sm:h-auto max-sm:min-h-10 max-sm:whitespace-normal max-sm:py-2 " +
                  (["accept", "start", "close"].includes(item)
                    ? "col-span-2 btn-primary"
                    : item === "cancel"
                      ? "btn-outline btn-error"
                      : "btn-outline")
                }
                onClick={() => setAction(item)}
              >
                {item === "review" ? "Revisar clasificación" : labels[item]}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] xl:grid-rows-[auto_auto_auto]">
        <section
          aria-labelledby="citizen-report"
          className="min-w-0 overflow-hidden rounded-2xl border border-base-300 bg-base-100"
        >
          <div className="flex items-center gap-3 border-b border-base-300 bg-base-200/55 p-4 sm:px-6">
            <span className="rounded-xl bg-base-300/60 p-2.5">
              <MessageSquare size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 id="citizen-report" className="text-lg font-bold">
                Reporte del ciudadano
              </h2>
              <p className="text-sm text-base-content/70">
                Descripción original
              </p>
            </div>
          </div>
          <div className="space-y-4 p-4 sm:p-6">
            <p className="whitespace-pre-wrap leading-relaxed [overflow-wrap:anywhere]">
              {incident.originalMessage}
            </p>
            {reporter && (
              <div className="flex items-center gap-3 border-t border-base-300 pt-4 text-sm">
                <UserRound
                  size={18}
                  className="shrink-0 text-base-content/60"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-base-content/65">Reportado por</p>
                  <p className="font-medium [overflow-wrap:anywhere]">
                    {reporter}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section
          aria-labelledby="classification-analysis"
          className="min-w-0 overflow-hidden rounded-2xl border border-base-300 bg-base-100 xl:col-start-2 xl:row-span-2 xl:row-start-1"
        >
          <div
            className={
              ai
                ? "flex flex-wrap items-center justify-between gap-3 border-b border-secondary/25 bg-secondary/10 p-4 sm:px-6"
                : "flex flex-wrap items-center justify-between gap-3 border-b border-base-300 bg-base-200/55 p-4 sm:px-6"
            }
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={
                  ai
                    ? "rounded-xl bg-secondary/15 p-2.5 text-secondary"
                    : "rounded-xl bg-base-300/60 p-2.5"
                }
              >
                <SourceIcon size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 id="classification-analysis" className="text-lg font-bold">
                  {ai ? "Análisis de IA" : "Clasificación de la incidencia"}
                </h2>
                {ai && (
                  <p className="text-sm text-base-content/70">
                    Propuesta para revisión municipal
                  </p>
                )}
              </div>
            </div>
            <span
              className={
                ai ? "badge badge-secondary badge-soft" : "badge badge-outline"
              }
            >
              {!hasClassification && analyzing ? "IA analizando" : sourceLabel}
            </span>
          </div>
          <div className="space-y-4 p-4 sm:p-6">
            {hasClassification ? (
              <>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-base-200/65 p-3">
                    <dt className="mb-1 text-base-content/70">
                      {ai ? "Gravedad estimada por IA" : "Gravedad"}
                    </dt>
                    <dd>
                      <IncidentUrgencyBadge urgency={incident.urgency} />
                    </dd>
                  </div>
                  <div className="rounded-xl bg-base-200/65 p-3">
                    <dt className="text-base-content/70">Categoría</dt>
                    <dd className="mt-1 font-medium [overflow-wrap:anywhere]">
                      {incident.category
                        ? enumLabel(incident.category)
                        : "Sin clasificar"}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-base-200/65 p-3">
                    <dt className="text-base-content/70">Tipo</dt>
                    <dd className="mt-1 font-medium [overflow-wrap:anywhere]">
                      {incident.type
                        ? enumLabel(incident.type)
                        : "Sin clasificar"}
                    </dd>
                  </div>
                  {incident.sentiment && (
                    <div className="rounded-xl bg-base-200/65 p-3">
                      <dt className="text-base-content/70">Tono del reporte</dt>
                      <dd className="mt-1 font-medium">
                        {enumLabel(incident.sentiment)}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  {incident.requiresSupervision && (
                    <span className="badge badge-warning badge-soft h-auto py-1">
                      Requiere supervisión
                    </span>
                  )}
                  {ai && incident.aiConfidence != null && (
                    <span className="text-base-content/75">
                      Confianza de la clasificación:{" "}
                      <strong>
                        {new Intl.NumberFormat("es-PE", {
                          style: "percent",
                          maximumFractionDigits: 1,
                        }).format(incident.aiConfidence)}
                      </strong>
                    </span>
                  )}
                  {source === "HUMAN" && incident.reviewedAt && (
                    <span className="text-base-content/75">
                      Revisada el {formatDate(incident.reviewedAt)}
                    </span>
                  )}
                </div>
                {incident.improvedDescription && (
                  <div className="space-y-1 border-t border-base-300 pt-4">
                    <h3 className="text-sm font-semibold">
                      {ai
                        ? "Resumen generado por IA"
                        : "Descripción de la clasificación"}
                    </h3>
                    <p className="whitespace-pre-wrap leading-relaxed [overflow-wrap:anywhere]">
                      {incident.improvedDescription}
                    </p>
                  </div>
                )}
                {incident.recommendedAction && (
                  <div
                    className={
                      ai
                        ? "space-y-1 rounded-xl bg-secondary/8 p-4"
                        : "space-y-1 rounded-xl bg-base-200 p-4"
                    }
                  >
                    <h3 className="text-sm font-semibold">
                      {ai ? "Acción sugerida por IA" : "Acción recomendada"}
                    </h3>
                    <p className="whitespace-pre-wrap leading-relaxed [overflow-wrap:anywhere]">
                      {incident.recommendedAction}
                    </p>
                  </div>
                )}
                {!!(incident.keywords?.length || incident.entities?.length) && (
                  <details className="rounded-xl border border-base-300 p-3 text-sm">
                    <summary className="cursor-pointer font-semibold">
                      Palabras clave y entidades
                    </summary>
                    {!!incident.keywords?.length && (
                      <ul
                        aria-label="Palabras clave"
                        className="mt-3 flex flex-wrap gap-2"
                      >
                        {incident.keywords.map((word, index) => (
                          <li
                            className="badge badge-ghost h-auto py-1 whitespace-normal [overflow-wrap:anywhere]"
                            key={index}
                          >
                            {word}
                          </li>
                        ))}
                      </ul>
                    )}
                    {!!incident.entities?.length && (
                      <dl
                        aria-label="Entidades"
                        className="mt-3 grid gap-2 sm:grid-cols-2"
                      >
                        {incident.entities.map((entity, index) => (
                          <div key={index}>
                            <dt className="text-xs text-base-content/70">
                              {enumLabel(entity.type)}
                            </dt>
                            <dd className="[overflow-wrap:anywhere]">
                              {entity.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </details>
                )}
              </>
            ) : (
              <p className="text-sm text-base-content/70">
                {analyzing
                  ? "La IA está analizando el reporte. Puedes continuar con la atención."
                  : jobStatus === "FAILED"
                    ? "El análisis de IA no pudo completarse. Puedes revisar la clasificación manualmente."
                    : "Todavía no hay una clasificación registrada."}
              </p>
            )}
          </div>
        </section>

        <section
          aria-labelledby="reported-location"
          className="min-w-0 space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6 xl:col-span-2 xl:row-start-3"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <span className="self-start rounded-xl bg-primary/10 p-2.5 text-primary">
                <MapPin size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-1">
                <h2
                  id="reported-location"
                  className="scroll-mt-24 text-lg font-bold"
                >
                  Ubicación reportada
                </h2>
                <p className="font-medium [overflow-wrap:anywhere]">
                  {incident.address ?? "Sin dirección registrada"}
                </p>
                {incident.addressReference && (
                  <p className="text-sm text-base-content/70 [overflow-wrap:anywhere]">
                    Referencia: {incident.addressReference}
                  </p>
                )}
                {coordinates && (
                  <p className="font-mono text-xs text-base-content/70">
                    {coordinates}
                  </p>
                )}
              </div>
            </div>
            {hasCoordinates && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                aria-haspopup="dialog"
                onClick={() => setMap(true)}
              >
                <Maximize2 size={16} aria-hidden="true" /> Ampliar mapa
              </button>
            )}
          </div>
          {hasCoordinates ? (
            <Suspense
              fallback={
                <p
                  role="status"
                  className="grid h-72 place-items-center rounded-xl bg-base-200 sm:h-[26rem]"
                >
                  Cargando mapa…
                </p>
              }
            >
              <IncidentMap items={[incident]} base={base} variant="location" />
            </Suspense>
          ) : (
            <p className="rounded-xl bg-base-200 p-4 text-sm">
              El reporte no tiene coordenadas disponibles para el mapa.
            </p>
          )}
        </section>

        <section
          aria-labelledby="incident-follow-up"
          className="min-w-0 space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6 xl:col-start-1 xl:row-start-2"
        >
          <h2 id="incident-follow-up" className="text-lg font-bold">
            Seguimiento municipal
          </h2>
          <dl className="grid grid-cols-2 gap-3 text-sm lg:grid-cols-5 xl:grid-cols-2">
            <div className="col-span-2 rounded-xl bg-base-200/65 p-3 lg:col-span-1 xl:col-span-2">
              <dt className="text-base-content/70">Responsable</dt>
              <dd className="mt-1 font-medium [overflow-wrap:anywhere]">
                {personName(incident.responsible) || "Sin responsable"}
              </dd>
            </div>
            {milestones.map(([label, date]) => (
              <div className="rounded-xl bg-base-200/65 p-3" key={label}>
                <dt className="text-base-content/70">{label}</dt>
                <dd className="mt-1 font-medium">
                  {date ? formatDate(date) : "—"}
                </dd>
              </div>
            ))}
          </dl>
          {(incident.resolutionSummary ||
            incident.cancellationReason ||
            incident.rejectionReason) && (
            <div className="space-y-2 border-t border-base-300 pt-4">
              <h3 className="font-semibold">
                {incident.resolutionSummary
                  ? "Resolución registrada"
                  : incident.cancellationReason
                    ? "Motivo de cancelación"
                    : "Motivo del rechazo"}
              </h3>
              <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                {incident.resolutionSummary ||
                  incident.cancellationReason ||
                  incident.rejectionReason}
              </p>
              {incident.rejectionComment && (
                <p className="whitespace-pre-wrap text-base-content/70 [overflow-wrap:anywhere]">
                  {incident.rejectionComment}
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {map && (
        <Dialog
          title="Mapa de la ubicación"
          onClose={() => setMap(false)}
          boxClassName="w-[96vw] max-w-6xl p-3 sm:p-6"
        >
          <p className="text-sm text-base-content/75 [overflow-wrap:anywhere]">
            {incident.address || coordinates}
          </p>
          <Suspense fallback={<p role="status">Cargando mapa…</p>}>
            <IncidentMap items={[incident]} base={base} variant="expanded" />
          </Suspense>
        </Dialog>
      )}

      <section
        aria-labelledby="incident-records"
        className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6"
      >
        <h2 id="incident-records" className="text-lg font-bold">
          Registros de la incidencia
        </h2>
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
                  if (file instanceof File)
                    operation.mutate({
                      type: "evidence",
                      args: [incident.id, file],
                    });
                }}
              >
                <input
                  className="file-input max-w-full"
                  name="file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  aria-label="Evidencia de atención"
                />
                <button className="btn" disabled={operation.isPending}>
                  {operation.isPending
                    ? "Preparando o subiendo…"
                    : "Adjuntar evidencia"}
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
                  <EvidenceGallery
                    incidentId={incident.id}
                    items={data.items}
                  />
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
      </section>
      {action && (
        <WorkflowDialog
          key={action}
          action={action}
          incident={incident}
          onClose={() => setAction(null)}
        />
      )}
    </section>
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
