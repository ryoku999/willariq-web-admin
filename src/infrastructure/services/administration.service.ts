import type { AdministrationRepository } from "@/core/contracts/administration.repository";
import { apiBlob, apiData } from "./api-data";

export const administrationService: AdministrationRepository = {
  prompts: (params) => apiData("GET", "/admin/ai/prompts", { params }),
  prompt: (id) => apiData("GET", `/admin/ai/prompts/${id}`),
  createPrompt: (data) => apiData("POST", "/admin/ai/prompts", { data }),
  activatePrompt: (id, active) =>
    apiData(
      "POST",
      `/admin/ai/prompts/${id}/${active ? "activate" : "deactivate"}`,
      { data: {} },
    ),
  validatePrompt: (id, output) =>
    apiData("POST", `/admin/ai/prompts/${id}/validate-output`, {
      data: { output },
    }),
  routes: (params) => apiData("GET", "/admin/ai/routes", { params }),
  createRoute: (data) => apiData("POST", "/admin/ai/routes", { data }),
  updateRoute: (id, data) =>
    apiData("PATCH", `/admin/ai/routes/${id}`, { data }),
  reorderRoutes: (capability, routeIds) =>
    apiData("PUT", "/admin/ai/routes/priorities", {
      data: { capability, routeIds },
    }),
  providers: () => apiData("GET", "/admin/ai/providers/status"),
  check: (capability) =>
    apiData("POST", "/admin/ai/config/check", { data: { capability } }),
  classificationSchema: () =>
    apiData("GET", "/admin/ai/contracts/incident-classification"),
  audit: (params) => apiData("GET", "/admin/audit-logs", { params }),
  auditEntry: (id) => apiData("GET", `/admin/audit-logs/${id}`),
  jobs: (params) => apiData("GET", "/admin/ai/jobs", { params }),
  job: (id) => apiData("GET", `/admin/ai/jobs/${id}`),
  outbox: (params) => apiData("GET", "/admin/queues/outbox", { params }),
  retryOutbox: (id) =>
    apiData("POST", `/admin/queues/outbox/${id}/retry`, { data: {} }),
  documents: (params) => apiData("GET", "/knowledge/documents", { params }),
  document: (id) => apiData("GET", `/knowledge/documents/${id}`),
  documentJobs: (id, params) =>
    apiData("GET", `/knowledge/documents/${id}/jobs`, { params }),
  uploadDocument: (file, title, sourceType) => {
    const data = new FormData();
    data.append("file", file);
    data.append("title", title);
    data.append("sourceType", sourceType);
    return apiData("POST", "/knowledge/documents", { data });
  },
  documentContent: (id) => apiBlob(`/knowledge/documents/${id}/content`),
  documentAction: (id, action) =>
    apiData("POST", `/knowledge/documents/${id}/${action}`, { data: {} }),
};
