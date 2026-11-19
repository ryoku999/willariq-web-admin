import type {
  AdminJob,
  AiPrompt,
  AiRoute,
  AuditEntry,
  Capability,
  KnowledgeDocument,
  OutboxEntry,
  PromptInput,
  ProviderStatus,
} from "@/core/entities/administration.entity";
import type { Job, Page, PageQuery } from "@/core/entities/operations.entity";

export interface AdministrationRepository {
  prompts(
    query: PageQuery & { capability: Capability },
  ): Promise<Page<AiPrompt>>;
  prompt(id: string): Promise<AiPrompt>;
  createPrompt(data: PromptInput): Promise<AiPrompt>;
  activatePrompt(id: string, active: boolean): Promise<unknown>;
  validatePrompt(id: string, output: object): Promise<unknown>;
  routes(query: PageQuery & { capability: Capability }): Promise<Page<AiRoute>>;
  createRoute(data: Omit<AiRoute, "id">): Promise<AiRoute>;
  updateRoute(
    id: string,
    data: Pick<AiRoute, "model" | "enabled" | "timeoutMs">,
  ): Promise<AiRoute>;
  reorderRoutes(capability: Capability, routeIds: string[]): Promise<unknown>;
  providers(): Promise<{ items: ProviderStatus[] }>;
  check(capability: Capability): Promise<unknown>;
  classificationSchema(): Promise<{ responseSchema: object }>;
  audit(
    query: PageQuery & {
      action?: string;
      entityType?: string;
      entityId?: string;
      actorId?: string;
      from?: string;
      to?: string;
    },
  ): Promise<Page<AuditEntry>>;
  auditEntry(id: string): Promise<AuditEntry>;
  jobs(query: PageQuery): Promise<Page<AdminJob>>;
  job(id: string): Promise<AdminJob>;
  outbox(query: PageQuery & { status?: string }): Promise<Page<OutboxEntry>>;
  retryOutbox(id: string): Promise<unknown>;
  documents(query: PageQuery): Promise<Page<KnowledgeDocument>>;
  document(id: string): Promise<KnowledgeDocument>;
  documentJobs(id: string, query: PageQuery): Promise<Page<Job>>;
  uploadDocument(
    file: File,
    title: string,
    sourceType: string,
  ): Promise<KnowledgeDocument>;
  documentContent(id: string): Promise<Blob>;
  documentAction(
    id: string,
    action: "process" | "publish" | "archive",
  ): Promise<unknown>;
}
