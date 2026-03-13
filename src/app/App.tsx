import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { LearningLogServiceProvider } from "./services/learningLogService";

export default function App() {
  return (
    <LearningLogServiceProvider>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </LearningLogServiceProvider>
  );
}
