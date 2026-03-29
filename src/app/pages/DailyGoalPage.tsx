import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { useLearningLogService, type DailyGoal } from "../services/learningLogService";
import { toast } from "sonner";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function DailyGoalPage() {
  const service = useLearningLogService();
  const [doGoal, setDoGoal] = useState("");
  const [notGoal, setNotGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [yesterdayGoal, setYesterdayGoal] = useState<DailyGoal | null>(null);
  const [yesterdayError, setYesterdayError] = useState<string | null>(null);
  const [loadingYesterday, setLoadingYesterday] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = useMemo(() => formatDate(new Date()), []);
  const yesterday = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return formatDate(date);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!service || hasLoaded) return;
    let ignore = false;
    setLoadingYesterday(true);
    setYesterdayError(null);
    (async () => {
      try {
        const [todayGoal, previousGoal] = await Promise.all([
          service.getDailyGoalForDate(today),
          service.getDailyGoalForDate(yesterday),
        ]);
        if (!ignore) {
          if (todayGoal) {
            setDoGoal(todayGoal.doGoal);
            setNotGoal(todayGoal.notGoal);
          }
          setYesterdayGoal(previousGoal);
        }
      } catch (error) {
        console.error("Failed to load daily goal", error);
        if (!ignore) {
          setYesterdayError("昨日の記録を取得できませんでした");
        }
      } finally {
        if (!ignore) {
          setHasLoaded(true);
          setLoadingYesterday(false);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [service, today, yesterday, hasLoaded]);

  const trimmedDoGoal = doGoal.trim();
  const trimmedNotGoal = notGoal.trim();
  const canSave = Boolean((trimmedDoGoal || trimmedNotGoal) && service && !saving);
  const yesterdayDoGoal = yesterdayGoal ? yesterdayGoal.doGoal.trim() : "";
  const yesterdayNotGoal = yesterdayGoal ? yesterdayGoal.notGoal.trim() : "";
  const hasYesterdayGoal = Boolean(yesterdayDoGoal || yesterdayNotGoal);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSave || !service) return;
    setSaving(true);
    try {
      await service.saveDailyGoal({
        date: today,
        doGoal: trimmedDoGoal,
        notGoal: trimmedNotGoal,
      });
      toast.success("保存しました");
    } catch (error) {
      console.error("Failed to save daily goal", error);
      toast.error("保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <AppHeader className="border-none" />
      <main className="mx-auto flex w-full flex-1 items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md flex-col items-center gap-8 text-center"
        >
          <div className="w-full rounded-3xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
            <p className="text-xs font-semibold tracking-wide text-gray-500">昨日の記録</p>
            {loadingYesterday ? (
              <div className="mt-3 space-y-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            ) : yesterdayError ? (
              <p className="mt-3 text-sm text-gray-500">{yesterdayError}</p>
            ) : hasYesterdayGoal ? (
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500">やること</p>
                  <p className="text-base text-gray-900">{yesterdayDoGoal || "未入力"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">やらないこと</p>
                  <p className="text-base text-gray-900">{yesterdayNotGoal || "未入力"}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">昨日の記録はありません。</p>
            )}
          </div>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            value={doGoal}
            onChange={(event) => setDoGoal(event.target.value.slice(0, 60))}
            placeholder="今日やることを一つ"
            maxLength={60}
            className="w-full border-b border-gray-200 bg-transparent px-2 pb-3 text-2xl font-light placeholder:text-gray-400 focus:border-gray-800 focus:outline-none"
          />
          <input
            type="text"
            value={notGoal}
            onChange={(event) => setNotGoal(event.target.value.slice(0, 60))}
            placeholder="やらないことを一つ"
            maxLength={60}
            className="w-full border-b border-gray-200 bg-transparent px-2 pb-3 text-2xl font-light placeholder:text-gray-400 focus:border-gray-800 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!canSave}
            className={`rounded-full border px-6 py-2 text-sm font-medium ${
              canSave
                ? "border-gray-900 text-gray-900 transition hover:bg-gray-900 hover:text-white"
                : "border-gray-200 text-gray-300"
            }`}
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </form>
      </main>
    </div>
  );
}
