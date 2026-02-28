import { Link, useLocation } from "react-router";
import { Home, Search, BarChart3 } from "lucide-react";

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive("/")
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Home className="size-5" />
            <span className="text-xs">ホーム</span>
          </Link>

          <Link
            to="/search"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive("/search")
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Search className="size-5" />
            <span className="text-xs">検索</span>
          </Link>

          <Link
            to="/monthly"
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
              isActive("/monthly")
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="size-5" />
            <span className="text-xs">月次レポート</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
