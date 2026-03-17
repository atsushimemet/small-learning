import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { useScrollToTop } from "../hooks/useScrollToTop";

type BreathingStep = {
  label: "吸う" | "止める" | "吐く";
  duration: number;
  circleScale: number;
  circleOpacity: number;
  pulseScale: number;
  pulseOpacity: number;
};

const breathingSteps: BreathingStep[] = [
  {
    label: "吸う",
    duration: 4000,
    circleScale: 1.05,
    circleOpacity: 1,
    pulseScale: 1.12,
    pulseOpacity: 0.55,
  },
  {
    label: "止める",
    duration: 2000,
    circleScale: 1.05,
    circleOpacity: 1,
    pulseScale: 1.12,
    pulseOpacity: 0.4,
  },
  {
    label: "吐く",
    duration: 6000,
    circleScale: 0.7,
    circleOpacity: 0.85,
    pulseScale: 0.78,
    pulseOpacity: 0.35,
  },
];

function SproutIllustration() {
  return (
    <svg
      viewBox="0 0 120 140"
      role="img"
      aria-hidden="true"
      className="mx-auto h-28 w-28 text-emerald-500"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M60 60 C62 90 56 110 60 132" />
        <path d="M60 98 C40 80 30 56 36 40 C48 12 76 14 82 40 C86 56 72 76 60 86" />
        <path d="M60 80 C78 60 90 40 86 24 C80 4 50 6 46 30 C44 46 52 62 60 72" />
      </g>
    </svg>
  );
}

export function ResetPage() {
  const [stageIndex, setStageIndex] = useState(0);
  const [memo, setMemo] = useState("");
  const [quietMode, setQuietMode] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [hasPromptedScroll, setHasPromptedScroll] = useState(false);
  const [hasBreathingStarted, setHasBreathingStarted] = useState(false);
  const breathingSectionRef = useRef<HTMLDivElement | null>(null);
  useScrollToTop();

  const handleReturnHome = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    const section = breathingSectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasBreathingStarted(true);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasBreathingStarted) return;
    const duration = breathingSteps[stageIndex]?.duration ?? 0;
    const timer = setTimeout(() => {
      setStageIndex((prev) => {
        const next = (prev + 1) % breathingSteps.length;
        if (next === 0) {
          setCompletedCycles((count) => count + 1);
        }
        return next;
      });
    }, duration);
    return () => {
      clearTimeout(timer);
    };
  }, [stageIndex, hasBreathingStarted]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stage = breathingSteps[stageIndex];
  const displayedStage = hasBreathingStarted
    ? stage
    : {
        circleScale: 0.6,
        circleOpacity: 0.8,
        pulseScale: 0.55,
        pulseOpacity: 0.3,
        duration: 0,
      };

  return (
    <div className="relative min-h-screen bg-white text-gray-900">
      <AppHeader className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80" />
      {quietMode && (
        <div className="quiet-overlay fixed inset-0 z-50 flex items-center justify-center bg-white px-6 py-10 text-center">
          <div className="space-y-6">
            <SproutIllustration />
            <div className="space-y-3">
              <p className="text-2xl font-light text-gray-800">また戻ればいい。</p>
              <p className="text-base text-gray-500">
                ここで手放した考えは、
                <br className="sm:hidden" />
                必要になったら考えましょう。
              </p>
            </div>
            <button
              className="rounded-full border border-gray-200 px-6 py-2 text-sm text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
              onClick={() => {
                setQuietMode(false);
                setStageIndex(0);
                setCompletedCycles(0);
                setHasPromptedScroll(false);
              }}
            >
              戻る
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8 text-gray-900 sm:px-6 sm:py-12">
        <section className="rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm sm:p-10">
          <p className="text-xs uppercase tracking-[0.4em] text-blue-500">reset</p>
          <div className="mt-6 space-y-5">
            <h1 className="text-3xl font-bold leading-snug text-gray-900 sm:text-5xl">
              いま、少しだけ頭を休ませませんか。
            </h1>
            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
              考え続けるあなたの1分リセット。呼吸を整え、気になっていることを書き出し、いったん手放す。
              手順は以下の通り。
            </p>
            <div className="grid gap-3 text-sm text-gray-500 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-inner">
                ① 深呼吸
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-inner">
                ② 頭の中を書き出す
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-inner">
                ③ いったん手放す
              </div>
            </div>
          </div>
        </section>

        <section
          ref={breathingSectionRef}
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-blue-500">01 / 深呼吸</p>
              <h2 className="text-xl font-light text-gray-900 sm:text-2xl">
                リズムに合わせて深呼吸しましょう。
              </h2>
            </div>
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="relative flex h-64 w-64 items-center justify-center">
                <div
                  className="breathing-circle absolute inset-6 rounded-full border border-gray-200"
                  style={{
                    transform: `scale(${displayedStage.circleScale})`,
                    opacity: displayedStage.circleOpacity,
                    transition: hasBreathingStarted
                      ? `transform ${stage.duration}ms ease-in-out, opacity ${stage.duration}ms ease-in-out`
                      : "none",
                  }}
                />
                <div
                  className="breathing-pulse absolute inset-12 rounded-full border border-gray-100"
                  style={{
                    transform: `scale(${displayedStage.pulseScale})`,
                    opacity: displayedStage.pulseOpacity,
                    transition: hasBreathingStarted
                      ? `transform ${stage.duration}ms ease-in-out, opacity ${stage.duration}ms ease-in-out`
                      : "none",
                  }}
                />
                <span className="relative text-4xl font-light tracking-wide text-gray-900">{stage.label}</span>
              </div>
              {completedCycles >= 1 && !hasPromptedScroll && (
                <button
                  type="button"
                  onClick={() => {
                    const section = document.getElementById("forget-section");
                    section?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    setHasPromptedScroll(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm transition hover:border-blue-200"
                >
                  <ArrowDown className="size-4" />
                  次のステップへ進む
                </button>
              )}
            </div>
          </div>
        </section>

        <section
          id="forget-section"
          className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm scroll-mt-32 sm:p-10"
        >
          <div className="space-y-10 sm:space-y-12">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-blue-500">02 / 頭の中を書き出す</p>
              <div className="mt-6 space-y-4">
                <textarea
                  id="forget-memo"
                  maxLength={100}
                  value={memo}
                  onChange={(event) => setMemo(event.target.value)}
                  placeholder="「明日の役員会で話すポイント」など、短い断片だけで構いません"
                  className="h-32 w-full rounded-3xl border border-gray-200 bg-gray-50 px-5 py-4 text-lg text-gray-800 outline-none transition placeholder:text-base placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
                />
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>この内容は保存されません</span>
                  <span>{memo.length}/100</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-blue-500">03 / いったん手放す</p>
              <div className="mt-1 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                <button
                  type="button"
                  className="mt-3 w-full max-w-xs rounded-full bg-blue-600 px-8 py-3 text-lg font-medium tracking-wide text-white transition hover:bg-blue-500"
                  onClick={() => {
                    setQuietMode(true);
                    setMemo("");
                    setHasPromptedScroll(true);
                  }}
                >
                  いったん手放す
                </button>
                <p className="mt-3 text-xs text-gray-400">このページで入力した内容は保存されません</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-dashed border-gray-200 bg-slate-50 p-6 text-center text-sm text-gray-500 sm:p-8">
          <p className="text-gray-600">
            みんないったん手放しています。
            <br className="sm:hidden" />
            安心して手放してください。
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-500 sm:flex-row sm:justify-center sm:gap-6">
            <p className="text-gray-500">学びに戻りたくなったら、こちらから。</p>
            <button
              type="button"
              onClick={handleReturnHome}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400"
            >
              学びに戻る
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
