import type {
  ChangePassword,
  ChatInput,
  ChatMessage,
  ChatSession,
  Notification,
} from "@/core/entities/engagement.entity";
import type { Job, Page, PageQuery } from "@/core/entities/operations.entity";

export interface EngagementRepository {
  notifications(
    query: PageQuery & { unreadOnly?: boolean },
  ): Promise<Page<Notification>>;
  unreadCount(): Promise<{ count: number }>;
  read(id: string): Promise<Notification>;
  readAll(): Promise<{ updated: number }>;
  sessions(query: PageQuery): Promise<Page<ChatSession>>;
  session(id: string): Promise<ChatSession>;
  createSession(title?: string): Promise<ChatSession>;
  messages(id: string, query: PageQuery): Promise<Page<ChatMessage>>;
  send(
    id: string,
    data: ChatInput,
  ): Promise<{ message: ChatMessage; job: Job }>;
  job(id: string): Promise<Job>;
  close(id: string): Promise<ChatSession>;
  setEmail(data: {
    email: string;
    currentPassword: string;
  }): Promise<{ email: string; emailVerifiedAt: string | null }>;
  requestVerification(): Promise<{ message: string }>;
  confirmEmail(token: string): Promise<{ message: string }>;
  forgotPassword(email: string): Promise<{ message: string }>;
  resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }>;
  changePassword(data: ChangePassword): Promise<{ message: string }>;
  logoutAll(): Promise<{ message: string }>;
}
