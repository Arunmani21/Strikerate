import { AppRoutes } from "./routes/routes";
import { Toaster } from "./components/ui/Toaster";

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}
