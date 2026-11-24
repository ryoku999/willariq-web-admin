import {
  ArrowRight,
  ClipboardList,
  Inbox,
  RefreshCw,
  Timer,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { DashboardSummary } from "@/core/entities/operations.entity";
import { useSummary } from "@/infrastructure/hooks/use-operations";
import { PanelPage, QueryView } from "@/presentation/components/PanelControls";
import { enumLabel } from "@/shared/utils/enum-labels";
import { formatDate } from "@/shared/utils/panel-format";
import { statusColors, urgencyColor } from "../operations/incident-colors";

const states = [
  "NEW",
  "ACCEPTED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
  "REJECTED",
] as const;
const timingLabels = {
  acceptance: "Envío → aceptación",
  start: "Envío → inicio de atención",
  handling: "Inicio de atención → cierre",
  closure: "Envío → cierre",
} as const;

const numbers = new Intl.NumberFormat("es-PE");
const minutes = (value: number | null) =>
  value === null ? "—" : numbers.format(value);
const percent = (count: number, total: number) =>
  total ? (100 * count) / total : 0;

function StatusBreakdown({ data }: { data: DashboardSummary }) {
  const counts = new Map(
    data.byStatus.map(({ status, count }) => [status, count]),
  );
  return (
    <section
      aria-labelledby="admin-status"
      className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="admin-status" className="text-lg font-bold">
            Incidencias por estado
          </h2>
          <p className="mt-1 text-sm text-base-content/70">
            Distribución de todas las incidencias visibles.
          </p>
        </div>
        <Link to="/incidents" className="btn btn-outline btn-sm">
          Ver bandeja <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {states.map((status) => {
          const count = counts.get(status) ?? 0;
          return (
            <li key={status} className="min-w-0">
              <Link
                to={"/incidents?status=" + status}
                className="block h-full rounded-xl border border-base-300 px-3 py-2.5 hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2 font-medium">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: statusColors[status] }}
                      aria-hidden="true"
                    />
                    {enumLabel(status)}
                  </span>
                  <span className="font-bold tabular-nums">
                    {numbers.format(count)}
                  </span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: percent(count, data.total) + "%",
                      backgroundColor: statusColors[status],
                    }}
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function AttentionTimings({ data }: { data: DashboardSummary }) {
  return (
    <section
      aria-labelledby="admin-timings"
      className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-primary/10 p-2 text-primary">
            <Timer size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="admin-timings" className="text-lg font-bold">
              Tiempos de atención
            </h2>
            <p className="mt-1 text-sm text-base-content/70">
              Reportes enviados desde el {formatDate(data.since)} · Tiempos en
              minutos
            </p>
          </div>
        </div>
        <span className="badge badge-primary badge-soft">Últimos 30 días</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(timingLabels) as (keyof typeof timingLabels)[]).map(
          (key) => {
            const metric = data.timings[key];
            return (
              <article
                key={key}
                className="min-w-0 rounded-xl border border-base-300 bg-base-200/55 p-3 sm:p-4"
              >
                <h3 className="text-sm font-semibold">{timingLabels[key]}</h3>
                <p className="mt-1 text-xs text-base-content/70">
                  {numbers.format(metric.count)}{" "}
                  {metric.count === 1 ? "caso medido" : "casos medidos"}
                </p>
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-base-300 pt-3">
                  {(
                    [
                      ["Promedio", metric.averageMinutes],
                      ["Mediana", metric.medianMinutes],
                      ["P90", metric.p90Minutes],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-base-content/70">{label}</dt>
                      <dd className="mt-0.5 text-lg font-bold tabular-nums [overflow-wrap:anywhere]">
                        {minutes(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            );
          },
        )}
      </div>
      <details className="rounded-xl bg-base-200/55 px-4 py-3 text-sm">
        <summary className="cursor-pointer font-semibold">
          Cómo se calculan los indicadores
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-base-content/75">
          <li>
            Cada duración se calcula entre las dos fechas indicadas. Solo cuenta
            casos con ambos hitos registrados.
          </li>
          <li>
            Los indicadores que terminan en cierre incluyen casos cerrados. La
            fecha de inicio registra el comienzo de la atención en el sistema.
          </li>
          <li>
            La mediana es el punto medio de las duraciones. El P90 indica el
            tiempo dentro del cual terminó aproximadamente el 90 % de los casos
            medidos.
          </li>
          <li>Una raya indica que no hay casos medidos para ese indicador.</li>
        </ul>
      </details>
    </section>
  );
}

export default function DashboardPage() {
  const query = useSummary();
  return (
    <PanelPage title="Panel de administración">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-base-content/70">
          Seguimiento de incidencias y tiempos de atención.
        </p>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          disabled={query.isFetching}
          onClick={() => void query.refetch()}
        >
          <RefreshCw
            size={16}
            aria-hidden="true"
            className={query.isFetching ? "animate-spin" : ""}
          />
          {query.isFetching ? "Actualizando…" : "Actualizar datos"}
        </button>
      </div>

      <QueryView query={query}>
        {(data) => (
          <>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-4">
                <span className="rounded-xl bg-primary/10 p-2 text-primary">
                  <ClipboardList size={20} aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-sm font-medium">Total de incidencias</dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums">
                    {numbers.format(data.total)}
                  </dd>
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-4">
                <span className="rounded-xl bg-warning/15 p-2 text-warning">
                  <Inbox size={20} aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-sm font-medium">Pendientes</dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums">
                    {numbers.format(data.pending.count)}
                  </dd>
                  {data.pending.oldestSubmittedAt && (
                    <dd className="mt-1 text-xs text-base-content/70">
                      Más antigua desde el{" "}
                      {formatDate(data.pending.oldestSubmittedAt)}
                    </dd>
                  )}
                </div>
              </div>
              <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-4">
                <span className="rounded-xl bg-info/15 p-2 text-info">
                  <Timer size={20} aria-hidden="true" />
                </span>
                <div>
                  <dt className="text-sm font-medium">
                    Enviadas en los últimos 30 días
                  </dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums">
                    {numbers.format(data.submitted)}
                  </dd>
                </div>
              </div>
            </dl>

            <StatusBreakdown data={data} />
            <AttentionTimings data={data} />

            <div className="grid gap-4 lg:grid-cols-2">
              <section
                aria-labelledby="admin-urgency"
                className="min-w-0 space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6"
              >
                <h2 id="admin-urgency" className="text-lg font-bold">
                  Incidencias por gravedad
                </h2>
                {data.byUrgency.length ? (
                  <dl className="divide-y divide-base-300">
                    {data.byUrgency.map(({ urgency, count }) => (
                      <div
                        key={urgency ?? "none"}
                        className="flex items-center justify-between gap-3 py-2 text-sm"
                      >
                        <dt className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: urgencyColor(urgency) }}
                            aria-hidden="true"
                          />
                          {urgency ? enumLabel(urgency) : "Sin clasificar"}
                        </dt>
                        <dd className="font-semibold tabular-nums">
                          {numbers.format(count)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-sm text-base-content/70">
                    Todavía no hay incidencias registradas.
                  </p>
                )}
              </section>
              <section
                aria-labelledby="admin-cancellations"
                className="min-w-0 space-y-3 rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-6"
              >
                <h2 id="admin-cancellations" className="text-lg font-bold">
                  Cancelaciones del período
                </h2>
                <p className="text-sm text-base-content/75">
                  <strong className="text-base-content">
                    {numbers.format(data.cancelled)}
                  </strong>{" "}
                  de {numbers.format(data.submitted)} reportes enviados
                  {data.submitted
                    ? " · " +
                      numbers.format(
                        Math.round(percent(data.cancelled, data.submitted)),
                      ) +
                      "%"
                    : ""}
                </p>
                {data.cancellationReasons.length > 0 && (
                  <dl className="divide-y divide-base-300">
                    {data.cancellationReasons.map(({ reason, count }) => (
                      <div
                        key={reason}
                        className="flex items-start justify-between gap-3 py-2 text-sm"
                      >
                        <dt className="min-w-0 [overflow-wrap:anywhere]">
                          {reason}
                        </dt>
                        <dd className="font-semibold tabular-nums">
                          {numbers.format(count)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            </div>
          </>
        )}
      </QueryView>
    </PanelPage>
  );
}
