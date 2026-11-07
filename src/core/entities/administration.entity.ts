import type { Job } from "./operations.entity";

export const capabilities = [
  "INCIDENT_CLASSIFICATION",
  "CHATBOT",
  "EMBEDDING",
] as const;
export const providers = ["OPENROUTER", "CEREBRAS", "GROQ"] as const;
export type Capability = (typeof capabilities)[number];
export interface AiPrompt {
  id: string;
  name: string;
  version: number;
  capability: Capability;
  active: boolean;
  systemPrompt: string;
  responseSchema: object | null;
}
export type PromptInput = Pick<
  AiPrompt,
  "name" | "version" | "capability" | "systemPrompt"
> & { responseSchema?: object };
export interface AiRoute {
  id: string;
  capability: Capability;
  provider: (typeof providers)[number];
  model: string;
  priority: number;
  enabled: boolean;
  timeoutMs: number;
}
export interface ProviderStatus {
  provider: string;
  credentialConfigured: boolean;
  availability: string;
}
export interface AuditEntry {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  oldValue?: unknown;
  newValue?: unknown;
}
export interface OutboxEntry {
  id: string;
  aggregateId: string;
  status: string;
  attempts: number;
  lastError: string | null;
  createdAt: string;
}
export interface AdminJob extends Job {
  incidentId: string | null;
  finalModel?: string | null;
  attempts?: {
    id: string;
    provider: string;
    model: string;
    status: string;
    errorCode: string | null;
    latencyMs: number | null;
  }[];
}
export interface KnowledgeDocument {
  id: string;
  title: string;
  sourceType: string;
  status: string;
  version: number;
  publications: {
    jobId: string;
    model: string;
    dimensions: number;
    publishedAt: string;
  }[];
}
