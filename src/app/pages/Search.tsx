import { useState } from "react";
import { Input } from "../components/ui/input";
import { LogList } from "../components/LogList";
import { BottomNav } from "../components/BottomNav";
import { learningLogService, type LearningLog } from "../services/learningLogService";
import { Search as SearchIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";

export function Search() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LearningLog[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      const results = learningLogService.searchLogs(value);
      setSearchResults(results);
      setHasSearched(true);
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-8 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SearchIcon className="size-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">検索</h1>
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
          <p className="text-gray-600">過去の学習ログを検索</p>
        </header>

        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="search"
              placeholder="キーワードで検索..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {!hasSearched ? (
          <div className="text-center py-12">
            <SearchIcon className="size-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">キーワードを入力して検索</p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {searchResults.length}件の結果
              </p>
            </div>
            <LogList logs={searchResults} />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
