import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { QuickInput } from "../components/QuickInput";
import { LogList } from "../components/LogList";
import {
  createGuestLearningLogService,
  LearningLogServiceProvider,
  useLearningLogService,
  type LearningLog,
} from "../services/learningLogService";

function TrialExperienceContent() {
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
    <div className="min-h-screen bg-white pb-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
        <header className="space-y-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="size-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">ちいさな学び</h1>
            </div>
            <p className="text-gray-600">ログインなしで1分アウトプットを体験できます</p>
          </div>
        </header>

        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:gap-4">
          <AlertTriangle className="size-8 text-amber-500" />
          <div className="space-y-2 text-sm text-amber-800">
            <p className="font-semibold">ゲスト体験モード</p>
            <p>このモードではページを離れると記録はすべて削除されます。</p>
            <p className="text-amber-700">
              学びを残したい場合はアカウントを作成してご利用ください。
            </p>
            <Link
              to="/sign-up"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              アカウントを作成
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <QuickInput
          onLogAdded={() => {
            void loadLogs();
          }}
        />

        <div>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">学習履歴</h2>
          <LogList logs={logs} />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-center text-sm text-gray-600">
          <p>本登録で検索・月次レポートなど全機能が解放されます。</p>
          <Link
            to="/sign-up"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 px-5 py-2 text-blue-700 transition hover:border-blue-300"
          >
            無料でアカウント作成
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function TrialExperience() {
  const guestService = useMemo(() => createGuestLearningLogService(), []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LearningLogServiceProvider service={guestService}>
      <TrialExperienceContent />
    </LearningLogServiceProvider>
  );
}
