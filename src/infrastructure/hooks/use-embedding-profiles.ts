import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { embeddingProfilesService } from "../services/embedding-profiles.service";

const queryKey = ["embedding-profiles"];

export function useEmbeddingProfiles() {
  return useQuery({ queryKey, queryFn: embeddingProfilesService.list });
}

export function useEmbeddingProfileAction<T, V>(
  action: (value: V) => Promise<T>,
) {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: action,
    onSuccess: () => cache.invalidateQueries({ queryKey }),
  });
}
