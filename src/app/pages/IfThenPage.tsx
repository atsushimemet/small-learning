import { useEffect, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { useLearningLogService } from "../services/learningLogService";
import { useNavigate } from "react-router";

type TriggerOption = {
  id: string;
  label: string;
};

const presetOptions: TriggerOption[] = [
  { id: "coffee", label: "朝コーヒーを飲んだあと" },
  { id: "lunch", label: "昼食を食べたあと" },
  { id: "after-work", label: "仕事を終えたあと" },
];

export function IfThenPage() {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customTrigger, setCustomTrigger] = useState("");
  const [initialLabel, setInitialLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const learningLogService = useLearningLogService();
  const navigate = useNavigate();

  const isCustom = selectedPreset === "custom";
  const selectedLabel =
    selectedPreset && selectedPreset !== "custom"
      ? presetOptions.find((option) => option.id === selectedPreset)?.label ?? ""
      : customTrigger;

  const handlePresetSelect = (optionId: string) => {
    setSelectedPreset(optionId);
    if (optionId !== "custom") {
      setCustomTrigger("");
    }
  };

  const handleSave = async () => {
    if (!selectedLabel || !learningLogService) return;
    setSaving(true);
    try {
      await learningLogService.saveLearningTrigger({
        triggerType: isCustom ? "custom" : "preset",
        triggerValue: selectedLabel,
      });
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      alert("トリガーの保存に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate("/", { replace: true });
  };
  const hasChanges =
    selectedPreset === "custom"
      ? customTrigger !== initialLabel
      : selectedPreset !== null &&
        (presetOptions.find((option) => option.id === selectedPreset)?.label ?? "") !== initialLabel;
  const canSave = Boolean(selectedLabel && learningLogService && !saving && hasChanges);

  useEffect(() => {
    if (!learningLogService) return;
    void (async () => {
      try {
        const trigger = await learningLogService.getLearningTrigger?.();
        if (!trigger) return;
        if (trigger.triggerType === "preset") {
          const preset = presetOptions.find((option) => option.label === trigger.triggerValue);
          if (preset) {
            setSelectedPreset(preset.id);
            setCustomTrigger("");
            setInitialLabel(trigger.triggerValue);
            return;
          }
        }
        setSelectedPreset("custom");
        setCustomTrigger(trigger.triggerValue);
        setInitialLabel(trigger.triggerValue);
      } catch (error) {
        console.error("Failed to load trigger", error);
      }
    })();
  }, [learningLogService]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <section className="space-y-3 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">IF-THEN</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">学びのきっかけを決める</h1>
          <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
            習慣は「このタイミングでやる」
            <br className="sm:hidden" />
            と決めると続きやすくなります。
            <br className="sm:hidden" />
            <span className="mt-2 block text-xs text-gray-500">
              例: 「コーヒーを淹れたら → 学びを1つ書く」
            </span>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500">トリガーを選択</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {presetOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handlePresetSelect(option.id)}
                className={`rounded-2xl border px-4 py-4 text-left text-sm font-medium transition ${
                  selectedPreset === option.id
                    ? "border-blue-400 bg-blue-50 text-blue-900"
                    : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-gray-500">別のトリガーを入力</p>
          <div className="rounded-2xl border border-gray-200 p-4">
            <label className="text-sm text-gray-500">「〜したら → 学びを書く」を自由に設定</label>
            <input
              type="text"
              placeholder="例: 通勤電車に乗ったら"
              value={customTrigger}
              onChange={(event) => {
                setCustomTrigger(event.target.value);
                setSelectedPreset("custom");
              }}
              className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 focus:border-blue-400 focus:outline-none"
            />
          </div>
        </section>

        {selectedLabel && (
          <section className="rounded-3xl border border-gray-100 bg-gray-50 p-6 text-center text-sm text-gray-600">
            <p className="text-base text-gray-700">
              {selectedLabel}
              <br />
              <span className="text-sm text-gray-500">ちいさな学びを書く</span>
            </p>
          </section>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-full border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:border-gray-300"
          >
            スキップ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
              canSave ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-300 text-gray-500"
            }`}
          >
            {saving ? "保存中..." : "トリガーを決める"}
          </button>
        </div>

        {!learningLogService && (
          <div className="text-xs text-gray-400">ログイン後にトリガーを保存できます。</div>
        )}
      </main>
    </div>
  );
}
