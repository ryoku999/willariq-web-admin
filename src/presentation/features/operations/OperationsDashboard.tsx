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
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="stat rounded-xl bg-base-100">
                <div className="stat-title">Incidencias visibles</div>
                <div className="stat-value">{data.total}</div>
              </div>
              <div className="stat rounded-xl bg-base-100">
                <div className="stat-title">
                  Resueltas en los últimos 30 días
                </div>
                <div className="stat-value">{data.resolution.count}</div>
              </div>
              <div className="stat rounded-xl bg-base-100">
                <div className="stat-title">Tiempo medio hasta resolución</div>
                <div className="stat-value">
                  {data.resolution.averageMinutes === null
                    ? "—"
                    : `${data.resolution.averageMinutes} min`}
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <PanelTable headers={["Estado", "Incidencias"]}>
                {data.byStatus.map((item) => (
                  <tr key={item.status}>
                    <td>{item.status}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </PanelTable>
              <PanelTable headers={["Urgencia", "Incidencias"]}>
                {data.byUrgency.map((item) => (
                  <tr key={item.urgency ?? "none"}>
                    <td>{item.urgency ?? "Sin clasificar"}</td>
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
