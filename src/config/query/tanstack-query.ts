import { isAxiosError } from "axios";
import { QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient({
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
