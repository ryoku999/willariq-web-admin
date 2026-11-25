import { formatDate } from "@/shared/utils/panel-format";
import { enumLabel } from "@/shared/utils/enum-labels";
import { useSummary } from "@/infrastructure/hooks/use-operations";
import {
  PanelPage,
  PanelTable,
  QueryView,
} from "@/presentation/components/PanelControls";

export default function OperationsDashboard() {
  const query = useSummary();
  return (
    <PanelPage
      title="Resumen operativo"
      description="Métricas calculadas por la API según el alcance de tu cuenta."
    >
      <button
        className="btn btn-sm"
        disabled={query.isFetching}
        onClick={() => void query.refetch()}
      >
        Actualizar métricas
      </button>
      <QueryView query={query}>
        {(data) => (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="stat rounded-xl bg-base-100">
                <div className="stat-title">Incidencias visibles</div>
                <div className="stat-value">{data.total}</div>
              </div>
              <div className="stat rounded-xl bg-base-100">
                <div className="stat-title">
                  Enviadas en los últimos 30 días
                </div>
                <div className="stat-value">{data.submitted}</div>
              </div>
              <div className="stat rounded-xl bg-base-100">
                <div className="stat-title">
                  Canceladas entre los envíos del período
                </div>
                <div className="stat-value">{data.cancelled}</div>
                <div className="stat-desc">
                  {data.submitted
                    ? Math.round((100 * data.cancelled) / data.submitted) + "%"
                    : "—"}
                </div>
              </div>
              <div className="stat rounded-xl bg-base-100">
                <div className="stat-title">Casos pendientes</div>
                <div className="stat-value">{data.pending.count}</div>
                {data.pending.oldestSubmittedAt && (
                  <div className="stat-desc">
                    Más antiguo desde{" "}
                    {formatDate(data.pending.oldestSubmittedAt)}
                  </div>
                )}
              </div>
            </div>
            <PanelTable
              headers={[
                "Tiempo",
                "Casos",
                "Promedio (min)",
                "Mediana (min)",
                "P90 (min)",
              ]}
            >
              {Object.entries({
                acceptance: "Envío a aceptación",
                start: "Envío a inicio",
                handling: "Inicio a cierre",
                closure: "Envío a cierre",
              } as const).map(([key, label]) => {
                const metric = data.timings[key as keyof typeof data.timings];
                return (
                  <tr key={key}>
                    <th>{label}</th>
                    <td>{metric.count}</td>
                    <td>{metric.averageMinutes ?? "—"}</td>
                    <td>{metric.medianMinutes ?? "—"}</td>
                    <td>{metric.p90Minutes ?? "—"}</td>
                  </tr>
                );
              })}
            </PanelTable>
            {data.cancellationReasons.length > 0 && (
              <PanelTable
                headers={["Motivo de cancelación en el período", "Casos"]}
              >
                {data.cancellationReasons.map(({ reason, count }) => (
                  <tr key={reason}>
                    <td>{reason}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </PanelTable>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <PanelTable headers={["Estado", "Incidencias"]}>
                {data.byStatus.map((item) => (
                  <tr key={item.status}>
                    <td>{enumLabel(item.status)}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </PanelTable>
              <PanelTable headers={["Urgencia", "Incidencias"]}>
                {data.byUrgency.map((item) => (
                  <tr key={item.urgency ?? "none"}>
                    <td>
                      {item.urgency
                        ? enumLabel(item.urgency)
                        : "Sin clasificar"}
                    </td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </PanelTable>
            </div>
          </>
        )}
      </QueryView>
    </PanelPage>
  );
}
