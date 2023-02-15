import "./App.css";
import SitesList from "./components/SitesList";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>MAAS Site Manager</h1>
        <SitesList />
      </div>
    </QueryClientProvider>
  );
}

export default App;
