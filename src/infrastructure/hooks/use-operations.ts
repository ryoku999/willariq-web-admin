import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  IncidentQuery,
  PageQuery,
} from "@/core/entities/operations.entity";
import type { OperationsRepository } from "@/core/contracts/operations.repository";
import { operationsService as api } from "../services/operations.service";

export const useSummary = () =>
  useQuery({
    queryKey: ["operations", "summary"],
    queryFn: api.summary,
    staleTime: 15000,
  });
export const useIncidents = (query: IncidentQuery) =>
  useQuery({
    queryKey: ["operations", "incidents", query],
    queryFn: () => api.incidents(query),
  });
export const useIncident = (id: string) =>
  useQuery({
    queryKey: ["operations", id, "detail"],
    queryFn: () => api.detail(id),
    enabled: !!id,
  });
export const useMyAssignments = (query: PageQuery) =>
  useQuery({
    queryKey: ["operations", "mine", query],
    queryFn: () => api.mine(query),
  });
export function useAssignmentsForIncident(
  id: string,
  query: PageQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: ["operations", id, "assignments", query],
    queryFn: () => api.assignments(id, query),
    enabled: !!id && enabled,
  });
}
export function useIncidentJobs(id: string, query: PageQuery, enabled = true) {
  return useQuery({
    queryKey: ["operations", id, "jobs", query],
    queryFn: () => api.jobs(id, query),
    enabled: !!id && enabled,
    refetchInterval: (q) =>
      q.state.data?.items.some((job) =>
        ["PENDING", "QUEUED", "PROCESSING"].includes(job.status),
      )
        ? 5000
        : false,
  });
}
export function useIncidentRecords(
  id: string,
  query: PageQuery,
  tab: "history" | "assignments" | "evidence" | "jobs",
) {
  return {
    history: useQuery({
      queryKey: ["operations", id, "history", query],
      queryFn: () => api.history(id, query),
      enabled: !!id && tab === "history",
    }),
    assignments: useAssignmentsForIncident(id, query, tab === "assignments"),
    evidence: useQuery({
      queryKey: ["operations", id, "evidence", query],
      queryFn: () => api.evidence(id, query),
      enabled: !!id && tab === "evidence",
    }),
    jobs: useIncidentJobs(id, query, tab === "jobs"),
  };
}
export function useOperationMutation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (
      operation:
        | { type: "incident"; args: Parameters<OperationsRepository["action"]> }
        | {
            type: "assignment";
            args: Parameters<OperationsRepository["assignmentAction"]>;
          }
        | {
            type: "evidence";
            args: Parameters<OperationsRepository["uploadEvidence"]>;
          },
    ) => {
      if (operation.type === "incident") return api.action(...operation.args);
      if (operation.type === "assignment")
        return api.assignmentAction(...operation.args);
      return api.uploadEvidence(...operation.args);
    },
    onSettled: () =>
      Promise.all([
        cache.invalidateQueries({ queryKey: ["operations"] }),
        cache.invalidateQueries({ queryKey: ["notifications"] }),
      ]),
  });
}
export const useEvidenceContent = (
  id: string,
  evidenceId: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: ["evidence-content", id, evidenceId],
    queryFn: () => api.evidenceContent(id, evidenceId),
    enabled,
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });
