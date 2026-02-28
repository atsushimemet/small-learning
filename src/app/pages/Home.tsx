import { useState, useEffect } from "react";
import { QuickInput } from "../components/QuickInput";
import { WeeklySummaryCard } from "../components/WeeklySummaryCard";
import { LogList } from "../components/LogList";
import { BottomNav } from "../components/BottomNav";
import { learningLogService, type LearningLog } from "../services/learningLogService";
import { BookOpen } from "lucide-react";

export function Home() {
  const [logs, setLogs] = useState<LearningLog[]>([]);

  const loadLogs = () => {
    setLogs(learningLogService.getAllLogs());
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="size-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">ちいさな学び</h1>
          </div>
          <p className="text-gray-600">今日の学びを1分で記録</p>
        </header>

        <div className="space-y-6">
          <QuickInput onLogAdded={loadLogs} />

          <WeeklySummaryCard />

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              学習履歴
            </h2>
            <LogList logs={logs} />
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
