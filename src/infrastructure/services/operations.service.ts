import type { OperationsRepository } from "@/core/contracts/operations.repository";
import { apiBlob, apiData } from "./api-data";

export const operationsService: OperationsRepository = {
  summary: () => apiData("GET", "/dashboard/summary"),
  incidents: (params) => apiData("GET", "/incidents", { params }),
  detail: (id) => apiData("GET", `/incidents/${id}`),
  history: (id, params) =>
    apiData("GET", `/incidents/${id}/history`, { params }),
  assignments: (id, params) =>
    apiData("GET", `/incidents/${id}/assignments`, { params }),
  mine: (params) => apiData("GET", "/assignments/me", { params }),
  evidence: (id, params) =>
    apiData("GET", `/incidents/${id}/evidence`, { params }),
  evidenceContent: (id, evidenceId) =>
    apiBlob(`/incidents/${id}/evidence/${evidenceId}/content`),
  uploadEvidence: (id, file) => {
    const data = new FormData();
    data.append("file", file);
    return apiData("POST", `/incidents/${id}/evidence`, { data });
  },
  jobs: (id, params) => apiData("GET", `/incidents/${id}/ai-jobs`, { params }),
  action: (id, action, data) =>
    apiData("POST", `/incidents/${id}/${action}`, { data }),
  assignmentAction: (id, action, data) =>
    apiData("POST", `/assignments/${id}/${action}`, { data }),
};
