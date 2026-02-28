import { type PropsWithChildren } from "react";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";

export function ProtectedRoute({ children }: PropsWithChildren) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
