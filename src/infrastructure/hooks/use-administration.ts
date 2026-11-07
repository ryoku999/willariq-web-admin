import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdministrationRepository } from "@/core/contracts/administration.repository";
import type { Capability } from "@/core/entities/administration.entity";
import { administrationService as api } from "../services/administration.service";

export const usePrompts = (capability: Capability, page: number) =>
  useQuery({
    queryKey: ["administration", "prompts", capability, page],
    queryFn: () => api.prompts({ capability, page, limit: 20 }),
  });
export const usePrompt = (id: string) =>
  useQuery({
    queryKey: ["administration", "prompt", id],
    queryFn: () => api.prompt(id),
    enabled: !!id,
  });
export const useRoutes = (capability: Capability) =>
  useQuery({
    queryKey: ["administration", "routes", capability],
    queryFn: () => api.routes({ capability, page: 1, limit: 100 }),
  });
export const useProviders = () =>
  useQuery({
    queryKey: ["administration", "providers"],
    queryFn: api.providers,
  });
export const useAudit = (
  query: Parameters<AdministrationRepository["audit"]>[0],
) =>
  useQuery({
    queryKey: ["administration", "audit", query],
    queryFn: () => api.audit(query),
  });
export const useAuditEntry = (id: string) =>
  useQuery({
    queryKey: ["administration", "audit", id],
    queryFn: () => api.auditEntry(id),
    enabled: !!id,
  });
export const useAdminJobs = (page: number) =>
  useQuery({
    queryKey: ["administration", "jobs", page],
    queryFn: () => api.jobs({ page, limit: 20 }),
  });
export const useAdminJob = (id: string) =>
  useQuery({
    queryKey: ["administration", "jobs", id],
    queryFn: () => api.job(id),
    enabled: !!id,
  });
export const useOutbox = (page: number, status?: string, enabled = true) =>
  useQuery({
    queryKey: ["administration", "outbox", page, status],
    queryFn: () => api.outbox({ page, limit: 20, status }),
    enabled,
  });
export const useDocuments = (page: number) =>
  useQuery({
    queryKey: ["administration", "documents", page],
    queryFn: () => api.documents({ page, limit: 20 }),
  });
export const useDocument = (id: string) =>
  useQuery({
    queryKey: ["administration", "document", id],
    queryFn: () => api.document(id),
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.status === "PROCESSING" ? 4000 : false,
  });
export const useDocumentJobs = (id: string, page: number) =>
  useQuery({
    queryKey: ["administration", "document", id, "jobs", page],
    queryFn: () => api.documentJobs(id, { page, limit: 10 }),
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.items.some((job) =>
        ["PENDING", "QUEUED", "PROCESSING"].includes(job.status),
      )
        ? 4000
        : false,
  });

type Commands = Pick<
  AdministrationRepository,
  | "createPrompt"
  | "activatePrompt"
  | "validatePrompt"
  | "createRoute"
  | "updateRoute"
  | "reorderRoutes"
  | "check"
  | "retryOutbox"
  | "uploadDocument"
  | "documentAction"
  | "documentContent"
  | "classificationSchema"
>;
export function useAdminAction<K extends keyof Commands>(key: K) {
  const cache = useQueryClient();
  const command = api[key] as (
    ...args: Parameters<Commands[K]>
  ) => Promise<Awaited<ReturnType<Commands[K]>>>;
  return useMutation({
    mutationFn: (args: Parameters<Commands[K]>) => command(...args),
    onSuccess: () => {
      if (
        ![
          "check",
          "validatePrompt",
          "documentContent",
          "classificationSchema",
        ].includes(key)
      )
        return cache.invalidateQueries({ queryKey: ["administration"] });
    },
  });
}
