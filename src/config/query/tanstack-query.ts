import { isAxiosError } from "axios";
import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage } from "@/shared/utils/panel-format";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(errorMessage(error));
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      const message = mutation.meta?.successMessage;
      if (typeof message === "string") toast.success(message);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (count, error) =>
        count < 2 &&
        !(
          isAxiosError(error) &&
          (error.response?.status ?? 0) >= 400 &&
          (error.response?.status ?? 0) < 500
        ),
      refetchOnWindowFocus: false,
    },
  },
});

export default queryClient;
