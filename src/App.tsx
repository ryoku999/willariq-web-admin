import { RouterProvider } from "react-router-dom";
import { routes } from "./presentation/routes/routes";

const App = () => {
  return <RouterProvider router={routes} />;
};

export default App;
