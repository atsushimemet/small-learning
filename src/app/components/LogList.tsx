import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { learningLogService, type LearningLog, type Tag } from "../services/learningLogService";
import { Calendar, BookOpen } from "lucide-react";

const AVAILABLE_TAGS: Tag[] = ["英語", "システム開発", "PM", "機械学習"];

export function LogList({ logs }: { logs: LearningLog[] }) {
  const [selectedFilter, setSelectedFilter] = useState<Tag | "all">("all");

  const filteredLogs =
    selectedFilter === "all"
      ? logs
      : logs.filter((log) => log.tags.includes(selectedFilter));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedFilter === "all" ? "default" : "outline"}
          className={`cursor-pointer transition-all ${
            selectedFilter === "all"
              ? "bg-blue-600 hover:bg-blue-700"
              : "hover:border-blue-400"
          }`}
          onClick={() => setSelectedFilter("all")}
        >
          すべて
        </Badge>
        {AVAILABLE_TAGS.map((tag) => (
          <Badge
            key={tag}
            variant={selectedFilter === tag ? "default" : "outline"}
            className={`cursor-pointer transition-all ${
              selectedFilter === tag
                ? "bg-blue-600 hover:bg-blue-700"
                : "hover:border-blue-400"
            }`}
            onClick={() => setSelectedFilter(tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>

      {filteredLogs.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <p className="text-center text-sm text-gray-500">
              {selectedFilter === "all"
                ? "まだ学習ログがありません"
                : `「${selectedFilter}」のログがありません`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Card
              key={log.id}
              className="border-gray-200 hover:border-blue-200 transition-colors"
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="size-3" />
                    {new Date(log.date).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {log.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-blue-100 text-blue-700"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2 mb-2">
                  <BookOpen className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="font-medium text-gray-900">{log.summary}</p>
                </div>

                <p className="text-sm text-gray-700 pl-6">{log.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
