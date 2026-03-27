import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { LearningLogServiceProvider } from "./services/learningLogService";
import { Analytics } from "@vercel/analytics/react";
import { usePageTracking } from "../hooks/usePageTracking";

export default function App() {
  usePageTracking(router);
  return (
    <LearningLogServiceProvider>
      <RouterProvider router={router} />
      <Analytics />
      <Toaster position="top-center" />
    </LearningLogServiceProvider>
  );
}
