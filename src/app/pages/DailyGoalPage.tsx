import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { useLearningLogService } from "../services/learningLogService";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const today = useMemo(() => formatDate(new Date()), []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!service || hasLoaded) return;
    let ignore = false;
    (async () => {
      try {
        const existing = await service.getDailyGoalForDate(today);
        if (existing && !ignore) {
          setDoGoal(existing.doGoal);
          setNotGoal(existing.notGoal);
        }
      } catch (error) {
        console.error("Failed to load daily goal", error);
      } finally {
        if (!ignore) {
          setHasLoaded(true);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [service, today, hasLoaded]);

  const trimmedDoGoal = doGoal.trim();
  const trimmedNotGoal = notGoal.trim();
  const canSave = Boolean((trimmedDoGoal || trimmedNotGoal) && service && !saving);

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
