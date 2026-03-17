import { UserButton } from "@clerk/clerk-react";
import { BookOpen } from "lucide-react";
import { Link } from "react-router";
import { HamburgerMenu } from "./HamburgerMenu";

type AppHeaderProps = {
  className?: string;
};

export function AppHeader({ className = "" }: AppHeaderProps) {
  return (
    <header className={`w-full border-b border-gray-100 bg-white ${className}`}>
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-gray-900 transition hover:opacity-80">
          <BookOpen className="size-7 text-blue-600" />
          <span className="text-2xl font-bold">ちいさな学び</span>
        </Link>
        <div className="flex items-center gap-3">
          <HamburgerMenu />
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </header>
  );
}
