import type { Incident } from "@/core/entities/operations.entity";
import { enumLabel } from "@/shared/utils/enum-labels";
import { statusColors, urgencyColor } from "./incident-colors";

export function IncidentStatusBadge({ status }: Pick<Incident, "status">) {
  return (
    <span
      className="badge badge-sm whitespace-nowrap border-transparent text-white"
      style={{ backgroundColor: statusColors[status] }}
    >
      {enumLabel(status)}
    </span>
  );
}

export function IncidentUrgencyBadge({ urgency }: Pick<Incident, "urgency">) {
  return (
    <span
      className="badge badge-sm whitespace-nowrap border-transparent text-white"
      style={{ backgroundColor: urgencyColor(urgency) }}
    >
      {urgency ? enumLabel(urgency) : "Sin clasificar"}
    </span>
  );
}
