import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { embeddingProfilesService } from "../services/embedding-profiles.service";

const queryKey = ["embedding-profiles"];

export function useEmbeddingProfiles() {
  return useQuery({ queryKey, queryFn: embeddingProfilesService.list });
}

export function useEmbeddingProfileAction<T, V>(
  action: (value: V) => Promise<T>,
  successMessage: string,
) {
  const cache = useQueryClient();
  return useMutation({
    meta: { successMessage },
    mutationFn: action,
    onSuccess: () => cache.invalidateQueries({ queryKey }),
  });
}
