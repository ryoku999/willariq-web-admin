import { statuses, urgencies } from "@/core/entities/operations.entity";

export const statusColors = {
  RECEIVED: "#475569",
  AI_ANALYSIS: "#6d28d9",
  IN_REVIEW: "#1d4ed8",
  ACCEPTED: "#0f766e",
  ASSIGNED: "#4338ca",
  IN_PROGRESS: "#92400e",
  RESOLVED: "#15803d",
  REJECTED: "#9f1239",
  CLOSED: "#334155",
  CANCELLED: "#52525b",
} satisfies Record<(typeof statuses)[number], string>;

const urgencyColors = {
  LOW: "#3f6212",
  MEDIUM: "#854d0e",
  HIGH: "#c2410c",
  CRITICAL: "#b91c1c",
} satisfies Record<(typeof urgencies)[number], string>;

export function urgencyColor(value: string | null) {
  return urgencies.find((urgency) => urgency === value)
    ? urgencyColors[value as keyof typeof urgencyColors]
    : "#64748b";
}
