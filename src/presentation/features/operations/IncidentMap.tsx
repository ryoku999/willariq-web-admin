import { IncidentStatusBadge, IncidentUrgencyBadge } from "./IncidentBadges";
import { statusColors, urgencyColor } from "./incident-colors";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import type { Incident } from "@/core/entities/operations.entity";

export default function IncidentMap({
  items,
  base,
}: {
  items: Incident[];
  base: string;
}) {
  const points = items.filter(
    (row) =>
      Number.isFinite(row.latitude) &&
      Number.isFinite(row.longitude) &&
      Math.abs(row.latitude) <= 90 &&
      Math.abs(row.longitude) <= 180,
  );
  if (!points.length)
    return <p className="alert">No hay coordenadas en esta página.</p>;
  const bounds = points.map(
    (row) => [row.latitude, row.longitude] as [number, number],
  );
  const key = points
    .map((row) => row.id + ":" + row.latitude + ":" + row.longitude)
    .join("|");
  const visibleStatuses = [...new Set(points.map((point) => point.status))];
  const visibleUrgencies = [...new Set(points.map((point) => point.urgency))];
  return (
    <section aria-label="Mapa de incidencias" className="space-y-3">
      <div
        className="flex flex-wrap gap-x-5 gap-y-2 rounded-xl border border-base-300 bg-base-100 p-3 text-sm"
        aria-label="Leyenda del mapa"
      >
        <div className="flex flex-wrap items-center gap-2">
          <strong>Relleno · Estado</strong>
          {visibleStatuses.map((status) => (
            <IncidentStatusBadge key={status} status={status} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <strong>Borde · Urgencia</strong>
          {visibleUrgencies.map((urgency) => (
            <IncidentUrgencyBadge key={urgency ?? "none"} urgency={urgency} />
          ))}
        </div>
      </div>
      <MapContainer
        key={key}
        bounds={bounds}
        boundsOptions={{ padding: [24, 24], maxZoom: 16 }}
        scrollWheelZoom={false}
        className="relative z-0 h-96 w-full rounded-xl"
      >
        <TileLayer
          url={
            import.meta.env.VITE_MAP_TILE_URL ||
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution={
            import.meta.env.VITE_MAP_ATTRIBUTION ||
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          }
        />
        {points.map((row) => (
          <CircleMarker
            key={row.id}
            center={[row.latitude, row.longitude]}
            radius={9}
            pathOptions={{
              color: urgencyColor(row.urgency),
              fillColor: statusColors[row.status],
              weight: row.urgency === "CRITICAL" ? 5 : 3,
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <Link to={`${base}/incidents/${row.id}`}>{row.trackingCode}</Link>
              {row.address && <p>{row.address}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                <IncidentStatusBadge status={row.status} />
                <IncidentUrgencyBadge urgency={row.urgency} />
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </section>
  );
}
