import { SignUp } from "@clerk/clerk-react";
import { useScrollToTop } from "../hooks/useScrollToTop";

export function SignUpPage() {
  useScrollToTop();
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
