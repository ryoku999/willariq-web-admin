import { RouterProvider } from "react-router-dom";
import { routes } from "./presentation/routes/routes";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./config/query/tanstack-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={routes} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
