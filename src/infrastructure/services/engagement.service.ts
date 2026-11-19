import type { EngagementRepository } from "@/core/contracts/engagement.repository";
import { apiData } from "./api-data";

export const engagementService: EngagementRepository = {
  notifications: (params) => apiData("GET", "/notifications", { params }),
  unreadCount: () => apiData("GET", "/notifications/unread-count"),
  read: (id) => apiData("PATCH", `/notifications/${id}/read`),
  readAll: () => apiData("POST", "/notifications/read-all"),
  sessions: (params) => apiData("GET", "/chat/sessions", { params }),
  session: (id) => apiData("GET", `/chat/sessions/${id}`),
  createSession: (title) =>
    apiData("POST", "/chat/sessions", { data: { title } }),
  messages: (id, params) =>
    apiData("GET", `/chat/sessions/${id}/messages`, { params }),
  send: (id, data) =>
    apiData("POST", `/chat/sessions/${id}/messages`, { data }),
  job: (id) => apiData("GET", `/chat/jobs/${id}`),
  close: (id) => apiData("POST", `/chat/sessions/${id}/close`, { data: {} }),
  setEmail: (data) => apiData("PUT", "/users/me/email", { data }),
  requestVerification: () =>
    apiData("POST", "/users/me/email/verification-requests", { data: {} }),
  confirmEmail: (token) =>
    apiData("POST", "/users/email-verifications/confirm", { data: { token } }),
  forgotPassword: (email) =>
    apiData("POST", "/auth/password/forgot", { data: { email } }),
  resetPassword: (token, newPassword) =>
    apiData("POST", "/auth/password/reset", { data: { token, newPassword } }),
  changePassword: (data) => apiData("PATCH", "/users/me/password", { data }),
  logoutAll: () => apiData("POST", "/auth/logout-all", { data: {} }),
};
