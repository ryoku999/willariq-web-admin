export const statuses = [
  "NEW",
  "ACCEPTED",
  "IN_PROGRESS",
  "REJECTED",
  "CLOSED",
  "CANCELLED",
] as const;
export const urgencies = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const types = [
  "INFRASTRUCTURE",
  "SECURITY",
  "HEALTH",
  "ENVIRONMENT",
  "NOISE",
  "TRAFFIC",
  "PUBLIC_SERVICES",
  "SOCIAL",
  "EMERGENCY",
  "OTHER",
] as const;
export const categories = [
  "FALLEN_UTILITY_POLE",
  "WATER_OUTAGE",
  "POWER_OUTAGE",
  "STREET_FIGHT",
  "THEFT",
  "TRAFFIC_ACCIDENT",
  "GARBAGE_ACCUMULATION",
  "POTHOLE",
  "FLOOD",
  "FIRE",
  "EXCESSIVE_NOISE",
  "VANDALISM",
  "LOOSE_ANIMALS",
  "AMBULANCE_REQUIRED",
  "POLICE_REQUIRED",
  "OTHER",
] as const;
export const sentiments = [
  "NEUTRAL",
  "WORRIED",
  "PANIC",
  "ANGRY",
  "URGENT",
] as const;
export interface Page<T> {
  items: T[];
  pagination: { page: number; limit: number; pages: number; total: number };
}
export interface PageQuery {
  page?: number;
  limit?: number;
}
export interface IncidentQuery extends PageQuery {
  status?: string;
  urgency?: string;
  trackingCode?: string;
  requiresSupervision?: boolean;
  responsibleId?: string;
}
export interface Incident {
  id: string;
  trackingCode: string;
  version: number;
  status: (typeof statuses)[number] | "RESOLVED";
  urgency: string | null;
  type: string | null;
  category: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  requiresSupervision: boolean;
  createdAt: string;
}
export interface IncidentDetail extends Incident {
  originalMessage: string;
  classificationSource: "AI" | "HUMAN" | "MANUAL_WITHOUT_AI" | null;
  reviewedAt: string | null;
  addressReference: string | null;
  improvedDescription: string | null;
  recommendedAction: string | null;
  sentiment: string | null;
  keywords: string[];
  entities: {
    type: string;
    value: string;
    confidence: number | string | null;
  }[];
  resolutionSummary: string | null;
  cancellationReason: string | null;
  responsibleId: string | null;
  responsible: { firstName: string | null; lastName: string | null } | null;
  submittedAt: string | null;
  acceptedAt: string | null;
  startedAt: string | null;
  closedAt: string | null;
  rejectionReason: string | null;
  rejectionComment: string | null;
}
export interface HistoryEntry {
  id: string;
  previousStatus: string | null;
  newStatus: string;
  actorType: string;
  comment: string | null;
  createdAt: string;
}
export interface Evidence {
  id: string;
  fileName: string;
  mimeType: string;
  status: string;
}
export interface Job {
  id: string;
  status: string;
  errorSummary?: string | null;
  createdAt: string;
  finalOutput?: {
    messageId?: string;
    embedded?: number;
    total?: number;
  } | null;
  dispatchStatus?: string;
}
export interface DashboardSummary {
  total: number;
  byStatus: { status: string; count: number }[];
  byUrgency: { urgency: string | null; count: number }[];
  since: string;
  submitted: number;
  cancelled: number;
  cancellationReasons: { reason: string; count: number }[];
  pending: { count: number; oldestSubmittedAt: string | null };
  timings: Record<
    "acceptance" | "start" | "handling" | "closure",
    {
      count: number;
      averageMinutes: number | null;
      medianMinutes: number | null;
      p90Minutes: number | null;
    }
  >;
}
export type IncidentAction =
  "review" | "accept" | "transfer" | "start" | "close" | "cancel" | "ai/retry";
