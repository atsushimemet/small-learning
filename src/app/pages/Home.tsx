import { useState, useEffect, useCallback } from "react";
import { QuickInput } from "../components/QuickInput";
import { LogList } from "../components/LogList";
import { BottomNav } from "../components/BottomNav";
import { AppHeader } from "../components/AppHeader";
import { useLearningLogService, type LearningLog } from "../services/learningLogService";

export function Home() {
  const [logs, setLogs] = useState<LearningLog[]>([]);
  const learningLogService = useLearningLogService();

  const loadLogs = useCallback(async () => {
    if (!learningLogService) return;
    const data = await learningLogService.getAllLogs();
    setLogs(data);
  }, [learningLogService]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  return (
    <div className="min-h-screen bg-white pb-20">
      <AppHeader className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="mb-8 text-base text-gray-600">今日の学びを1分で記録</p>

        <div className="space-y-6">
          <QuickInput onLogAdded={loadLogs} />

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
