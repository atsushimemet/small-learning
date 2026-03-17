import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { LearningLogServiceProvider } from "./services/learningLogService";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <LearningLogServiceProvider>
      <RouterProvider router={router} />
      <Analytics />
      <Toaster position="top-center" />
    </LearningLogServiceProvider>
  );
}
