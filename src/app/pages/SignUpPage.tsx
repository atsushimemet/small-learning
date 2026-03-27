import { useEffect } from "react";
import { SignUp } from "@clerk/clerk-react";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { clearFlow, getFlow } from "../../utils/flowTracking";
import { getPageMetadata, sendGtagEvent } from "../../utils/gtag";

export function SignUpPage() {
  useScrollToTop();
  useEffect(() => {
    const flow = getFlow();
    sendGtagEvent("sign_up_complete", {
      ...getPageMetadata(),
      page_path: "/sign-up",
      flow,
    });
    clearFlow();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/ifthen"
        fallbackRedirectUrl="/ifthen"
      />
    </div>
  );
}
