export interface EmbeddingProfileInput {
  model: string;
  dimensions: number;
  timeoutMs: number;
  batchSize: number;
}

export interface EmbeddingProfile extends EmbeddingProfileInput {
  id: string;
  provider: "OPENROUTER";
  active: boolean;
}

export interface EmbeddingReindexResult {
  requested: number;
  failed: { title: string; reason: string }[];
}
