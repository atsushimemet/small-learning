import { SignIn } from "@clerk/clerk-react";
import { useScrollToTop } from "../hooks/useScrollToTop";

export function SignInPage() {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/"
      />
    </div>
  );
}
