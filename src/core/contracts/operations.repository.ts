import type {
  Assignment,
  DashboardSummary,
  Evidence,
  HistoryEntry,
  Incident,
  IncidentAction,
  IncidentDetail,
  IncidentQuery,
  Job,
  Page,
  PageQuery,
} from "@/core/entities/operations.entity";

export interface OperationsRepository {
  summary(): Promise<DashboardSummary>;
  incidents(query: IncidentQuery): Promise<Page<Incident>>;
  detail(id: string): Promise<IncidentDetail>;
  history(id: string, query: PageQuery): Promise<Page<HistoryEntry>>;
  assignments(id: string, query: PageQuery): Promise<Page<Assignment>>;
  mine(query: PageQuery): Promise<Page<Assignment>>;
  evidence(id: string, query: PageQuery): Promise<Page<Evidence>>;
  evidenceContent(id: string, evidenceId: string): Promise<Blob>;
  uploadEvidence(id: string, file: File): Promise<unknown>;
  jobs(id: string, query: PageQuery): Promise<Page<Job>>;
  action(
    id: string,
    action: IncidentAction,
    body: Record<string, unknown>,
  ): Promise<unknown>;
  assignmentAction(
    id: string,
    action: "accept" | "cancel",
    body: Record<string, unknown>,
  ): Promise<unknown>;
}
