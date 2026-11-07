import { enumLabel } from "@/shared/utils/enum-labels";
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
  return (
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
          radius={8}
          pathOptions={{
            color: row.urgency === "CRITICAL" ? "#b91c1c" : "#1d4ed8",
            fillOpacity: 0.7,
          }}
        >
          <Popup>
            <Link to={`${base}/incidents/${row.id}`}>{row.trackingCode}</Link>
            <br />
            {row.address ?? enumLabel(row.status)}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
