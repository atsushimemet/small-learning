import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { jaJP } from "@clerk/localizations";
import App from "./app/App.tsx";
import "./styles/index.css";
import { router } from "./app/routes";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider
    publishableKey={clerkPublishableKey}
    navigate={(to) => router.navigate(to)}
    localization={jaJP}
    signInUrl="/sign-in"
    signUpUrl="/sign-up"
  >
    <App />
  </ClerkProvider>
);
