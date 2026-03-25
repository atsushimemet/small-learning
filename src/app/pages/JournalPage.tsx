import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "../components/AppHeader";
import { useLearningLogService } from "../services/learningLogService";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function JournalPage() {
  const service = useLearningLogService();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const today = useMemo(() => formatDate(new Date()), []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!service || hasLoaded) return;
    let ignore = false;
    (async () => {
      try {
        const entry = await service.getJournalEntryForDate(today);
        if (entry && !ignore) {
          setContent(entry.content);
        }
      } catch (error) {
        console.error("Failed to load journal entry", error);
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

  const remaining = Math.max(0, 140 - content.length);
  const trimmedContent = content.trim();
  const canSave = Boolean(trimmedContent && service && !saving);

  const saveEntry = async () => {
    if (!canSave || !service) return;
    setSaving(true);
    try {
      await service.saveJournalEntry({
        date: today,
        content: trimmedContent,
      });
      toast.success("保存しました");
    } catch (error) {
      console.error("Failed to save journal entry", error);
      toast.error("保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void saveEntry();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void saveEntry();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <AppHeader className="border-none" />
      <main className="mx-auto flex w-full flex-1 items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-md flex-col items-stretch gap-8"
        >
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold tracking-wide text-gray-500">
              ポジティブな日記を書きましょう。
            </p>
            <p className="text-base text-gray-600">
              昨日あるいは今日よかったことを一つ、静かに言葉にしてみてください。
            </p>
          </div>
          <div className="relative w-full">
            <textarea
              ref={textareaRef}
              autoFocus
              value={content}
              onChange={(event) => setContent(event.target.value.slice(0, 140))}
              onKeyDown={handleKeyDown}
              maxLength={140}
              rows={6}
              className="h-60 w-full resize-none rounded-3xl border border-gray-200 bg-transparent px-5 py-4 text-2xl font-light leading-relaxed placeholder:text-gray-400 focus:border-gray-800 focus:outline-none"
            />
            <span className="pointer-events-none absolute bottom-4 right-5 text-xs text-gray-400">
              残り{remaining}文字
            </span>
          </div>
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
