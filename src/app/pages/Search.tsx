import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { LogList } from "../components/LogList";
import { BottomNav } from "../components/BottomNav";
import {
  useLearningLogService,
  type LearningLog,
  type Tag,
  PRESET_TAGS,
} from "../services/learningLogService";
import { Search as SearchIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";

export function Search() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LearningLog[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([...PRESET_TAGS]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isYesterdaySelected, setIsYesterdaySelected] = useState(false);
  const [yesterdayLogs, setYesterdayLogs] = useState<LearningLog[] | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const learningLogService = useLearningLogService();

  useEffect(() => {
    if (!learningLogService) return;
    let isMounted = true;

    const loadUserTags = async () => {
      try {
        const tags = await learningLogService.getUserTags();
        if (!isMounted) return;
        setAvailableTags((prev) => {
          const merged = new Set([...prev, ...tags]);
          return Array.from(merged);
        });
      } catch (error) {
        console.error("Failed to fetch user tags", error);
      }
    };

    void loadUserTags();

    return () => {
      isMounted = false;
    };
  }, [learningLogService]);

  useEffect(() => {
    if (!learningLogService) return;
    let isMounted = true;

    const loadYesterdayLogs = async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split("T")[0];
      try {
        const logs = await learningLogService.getLogsForDate(dateStr);
        if (!isMounted) return;
        setYesterdayLogs(logs);
      } catch (error) {
        console.error("Failed to fetch yesterday logs", error);
      }
    };

    void loadYesterdayLogs();
    return () => {
      isMounted = false;
    };
  }, [learningLogService]);

  const handleSearch = async (value: string) => {
    setQuery(value);
    setSelectedTag(null);
    setIsYesterdaySelected(false);
    if (value.trim()) {
      if (learningLogService) {
        setIsSearching(true);
        try {
          const results = await learningLogService.searchLogs(value);
          setSearchResults(results);
          setHasSearched(true);
        } finally {
          setIsSearching(false);
        }
      }
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  const handleTagSearch = async (tag: Tag) => {
    if (!learningLogService) return;
    setSelectedTag(tag);
    setIsYesterdaySelected(false);
    setQuery("");
    setIsSearching(true);
    try {
      const results = await learningLogService.getLogsByTag(tag);
      setSearchResults(results);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleYesterdaySearch = async () => {
    if (!learningLogService) return;
    setIsYesterdaySelected(true);
    setSelectedTag(null);
    setQuery("");
    setIsSearching(true);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];
    try {
      const results = await learningLogService.getLogsForDate(dateStr);
      setSearchResults(results);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
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

        <div className="mb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="search"
              placeholder="キーワードで検索..."
              value={query}
              onChange={(e) => {
                void handleSearch(e.target.value);
              }}
              className="pl-10"
            />
          </div>
        </div>
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {yesterdayLogs && yesterdayLogs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  void handleYesterdaySearch();
                }}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap ${
                  isYesterdaySelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 hover:border-blue-400 text-gray-700"
                }`}
              >
                昨日
              </button>
            )}
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  void handleTagSearch(tag);
                }}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors whitespace-nowrap ${
                  selectedTag === tag
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 hover:border-blue-400 text-gray-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            登録済みタグをタップして検索できます
          </p>
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
                {isSearching ? "検索中..." : `${searchResults.length}件の結果`}
              </p>
              {selectedTag && (
                <p className="text-xs text-blue-600 mt-1">
                  タグ「{selectedTag}」で検索中
                </p>
              )}
              {isYesterdaySelected && (
                <p className="text-xs text-blue-600 mt-1">
                  昨日の学習ログを表示中
                </p>
              )}
            </div>
            <LogList logs={searchResults} />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
