import "./App.scss";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AppContextProvider, AuthContextProvider } from "./context";
import routes from "./routes";

import apiClient from "@/api";
import { createBrowserRouter, RouterProvider } from "@/router";

const queryClient = new QueryClient();
const router = createBrowserRouter(routes);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <AuthContextProvider apiClient={apiClient}>
          <RouterProvider router={router} />
        </AuthContextProvider>
      </AppContextProvider>
    </QueryClientProvider>
  );
};

export default App;
