export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  createdAt: string;
  readAt: string | null;
}
export interface ChatSession {
  id: string;
  title: string | null;
  status: "ACTIVE" | "CLOSED";
  updatedAt: string;
}
export interface ChatSource {
  ref: number;
  documentId: string;
  chunkId: string;
  title: string;
  section: string[];
  chunkIndex: number;
}
export interface ChatMessage {
  id: string;
  content: string;
  role: "USER" | "ASSISTANT";
  createdAt: string;
  metadata?: { kind: string; sources?: ChatSource[] };
}
export interface ChatInput {
  clientRequestId: string;
  content: string;
  trackingCode?: string;
}
export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}
