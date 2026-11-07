import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EngagementRepository } from "@/core/contracts/engagement.repository";
import { engagementService as api } from "../services/engagement.service";

export const useUnreadCount = () =>
  useQuery({
    queryKey: ["notifications", "count"],
    queryFn: api.unreadCount,
    refetchInterval: 30000,
  });
export const useNotifications = (page: number, unreadOnly: boolean) =>
  useQuery({
    queryKey: ["notifications", page, unreadOnly],
    queryFn: () => api.notifications({ page, limit: 20, unreadOnly }),
  });
export const useChatSessions = (page: number) =>
  useQuery({
    queryKey: ["chat", "sessions", page],
    queryFn: () => api.sessions({ page, limit: 20 }),
  });
export const useChatSession = (id: string) =>
  useQuery({
    queryKey: ["chat", id, "session"],
    queryFn: () => api.session(id),
    enabled: !!id,
  });
export const useChatMessages = (id: string, page: number) =>
  useQuery({
    queryKey: ["chat", id, "messages", page],
    queryFn: () => api.messages(id, { page, limit: 20 }),
    enabled: !!id,
  });
export const useChatJob = (id: string) =>
  useQuery({
    queryKey: ["chat", "jobs", id],
    queryFn: () => api.job(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const job = query.state.data;
      return job &&
        ["PENDING", "QUEUED", "PROCESSING"].includes(job.status) &&
        job.dispatchStatus !== "DEAD"
        ? 2500
        : false;
    },
  });
type Commands = Omit<
  EngagementRepository,
  "notifications" | "unreadCount" | "sessions" | "session" | "messages" | "job"
>;
export function useEngagementAction<K extends keyof Commands>(key: K) {
  const cache = useQueryClient();
  const command = api[key] as (
    ...args: Parameters<Commands[K]>
  ) => Promise<Awaited<ReturnType<Commands[K]>>>;
  return useMutation({
    mutationFn: (args: Parameters<Commands[K]>) => command(...args),
    onSuccess: () => {
      if (key === "read" || key === "readAll")
        return cache.invalidateQueries({ queryKey: ["notifications"] });
      if (key === "createSession" || key === "send" || key === "close")
        return cache.invalidateQueries({ queryKey: ["chat"] });
      if (key === "setEmail" || key === "confirmEmail")
        return cache.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}
