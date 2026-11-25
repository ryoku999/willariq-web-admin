import {
  ArrowRight,
  CircleAlert,
  ClipboardList,
  Inbox,
  Timer,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { IncidentQuery } from "@/core/entities/operations.entity";
import { useIncidents } from "@/infrastructure/hooks/use-operations";
import { PanelPage } from "@/presentation/components/PanelControls";
import { errorMessage } from "@/shared/utils/panel-format";
import {
  IncidentStatusBadge,
  IncidentUrgencyBadge,
} from "../../../operations/IncidentBadges";
import OperationsDashboard from "../../../operations/OperationsDashboard";

const inboxPath = "/operator/incidents";

const queues = [
  {
    key: "new",
    title: "Nuevas",
    icon: Inbox,
    iconStyle: "bg-primary/10 text-primary",
    filter: { status: "NEW" },
    empty: "No hay incidencias nuevas.",
  },
  {
    key: "critical",
    title: "Críticas",
    icon: CircleAlert,
    iconStyle: "bg-error/10 text-error",
    filter: { urgency: "CRITICAL" },
    empty: "No hay incidencias con gravedad crítica.",
  },
  {
    key: "in-progress",
    title: "En atención",
    icon: Timer,
    iconStyle: "bg-warning/15 text-warning",
    filter: { status: "IN_PROGRESS" },
    empty: "No hay incidencias en atención.",
  },
] satisfies ReadonlyArray<{
  key: string;
  title: string;
  icon: typeof Inbox;
  iconStyle: string;
  filter: Pick<IncidentQuery, "status" | "urgency">;
  empty: string;
}>;

function QueueCard({ queue }: { queue: (typeof queues)[number] }) {
  const query = useIncidents({ ...queue.filter, page: 1, limit: 3 });
  const Icon = queue.icon;
  const params = new URLSearchParams();
  if (queue.filter.status) params.set("status", queue.filter.status);
  if (queue.filter.urgency) params.set("urgency", queue.filter.urgency);
  const destination = inboxPath + "?" + params.toString();
  const total = query.data?.pagination.total;
  const headingId = "operator-queue-" + queue.key;

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col rounded-2xl border border-base-300 bg-base-100"
    >
      <Link
        to={destination}
        aria-label={"Ver incidencias " + queue.title.toLowerCase()}
        className="group flex items-start gap-3 rounded-t-2xl p-4 hover:bg-base-200/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:p-5"
      >
        <span className={"rounded-xl p-2.5 " + queue.iconStyle}>
          <Icon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="font-semibold">
            {queue.title}
          </h2>
          <p
            className="mt-1 text-3xl font-bold tabular-nums"
            aria-live="polite"
          >
            {total ?? "—"}
          </p>
          {queue.key === "critical" && (
            <p className="mt-1 text-xs text-base-content/70">
              De todos los estados
            </p>
          )}
        </div>
        <ArrowRight
          size={17}
          className="mt-1 shrink-0 text-base-content/60 group-hover:text-primary"
          aria-hidden="true"
        />
      </Link>

      <div className="flex-1 border-t border-base-300 px-4 py-3 sm:px-5">
        {query.isPending && (
          <p role="status" className="py-2 text-sm text-base-content/70">
            Cargando incidencias…
          </p>
        )}
        {query.isError && (
          <div className="space-y-2 py-2">
            <p
              role="alert"
              className="text-sm text-error [overflow-wrap:anywhere]"
            >
              {errorMessage(query.error)}
            </p>
            <button
              type="button"
              className="btn btn-sm"
              disabled={query.isFetching}
              onClick={() => void query.refetch()}
            >
              Reintentar
            </button>
          </div>
        )}
        {query.data &&
          (query.data.items.length ? (
            <ul className="divide-y divide-base-300">
              {query.data.items.map((incident) => (
                <li key={incident.id}>
                  <Link
                    to={inboxPath + "/" + incident.id}
                    className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 rounded-lg py-2.5 text-sm hover:text-primary"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold [overflow-wrap:anywhere]">
                        {incident.trackingCode}
                      </span>
                      {incident.address && (
                        <span className="mt-0.5 block text-xs text-base-content/70 [overflow-wrap:anywhere]">
                          {incident.address}
                        </span>
                      )}
                    </span>
                    {queue.key === "critical" ? (
                      <IncidentStatusBadge status={incident.status} />
                    ) : (
                      <IncidentUrgencyBadge urgency={incident.urgency} />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-2 text-sm text-base-content/70">{queue.empty}</p>
          ))}
      </div>
    </section>
  );
}

export default function OperatorDashboard() {
  const [metricsOpen, setMetricsOpen] = useState(false);
  return (
    <PanelPage title="Panel del operador">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Incidencias</h2>
        <Link to={inboxPath} className="btn btn-primary btn-sm">
          <ClipboardList size={17} aria-hidden="true" /> Abrir bandeja
        </Link>
      </div>
      <div className="grid items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3">
        {queues.map((queue) => (
          <QueueCard key={queue.key} queue={queue} />
        ))}
      </div>
      <details
        className="rounded-2xl border border-base-300 bg-base-100 p-4 sm:p-5"
        onToggle={(event) => setMetricsOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer font-semibold">
          Métricas de atención
        </summary>
        {metricsOpen && (
          <div className="mt-5 min-w-0">
            <OperationsDashboard />
          </div>
        )}
      </details>
    </PanelPage>
  );
}
