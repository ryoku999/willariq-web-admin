import type {
  EmbeddingProfile,
  EmbeddingProfileInput,
  EmbeddingReindexResult,
} from "@/core/entities/embedding-profile.entity";
import { apiData } from "./api-data";

const path = "/admin/ai/embedding-profiles";

export const embeddingProfilesService = {
  list: () => apiData<EmbeddingProfile[]>("GET", path),
  save: (data: EmbeddingProfileInput) =>
    apiData<EmbeddingProfile>("POST", path, { data }),
  reindex: (id: string) =>
    apiData<EmbeddingReindexResult>("POST", `${path}/${id}/reindex`),
  activate: (id: string) =>
    apiData<EmbeddingProfile>("POST", `${path}/${id}/activate`),
};
