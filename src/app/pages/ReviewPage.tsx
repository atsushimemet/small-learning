import { useMemo, useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { useScrollToTop } from "../hooks/useScrollToTop";

type Question = {
  id: string;
  category: "睡眠" | "食事" | "活動" | "会話" | "気分";
  text: string;
  options: { label: string; value: string }[];
};

const questions: Question[] = [
  {
    id: "sleep",
    category: "睡眠",
    text: "よく寝れましたか？",
    options: [
      { label: "はい", value: "yes" },
      { label: "いいえ", value: "no" },
      { label: "わからない", value: "unknown" },
    ],
  },
  {
    id: "meal",
    category: "食事",
    text: "野菜を食べましたか？",
    options: [
      { label: "はい", value: "yes" },
      { label: "いいえ", value: "no" },
    ],
  },
  {
    id: "walk",
    category: "活動",
    text: "外を歩きましたか？",
    options: [
      { label: "はい", value: "yes" },
      { label: "いいえ", value: "no" },
      { label: "わからない", value: "unknown" },
    ],
  },
  {
    id: "talk",
    category: "会話",
    text: "誰かと話しましたか？",
    options: [
      { label: "はい", value: "yes" },
      { label: "いいえ", value: "no" },
    ],
  },
  {
    id: "mood",
    category: "気分",
    text: "1日を通じて気分はどうでしたか？",
    options: [
      { label: "良い", value: "good" },
      { label: "悪い", value: "bad" },
      { label: "わからない", value: "unknown" },
    ],
  },
];

const positiveValues = new Set(["yes", "good"]);

export function ReviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  useScrollToTop();

  const isComplete = currentIndex >= questions.length;

  const summary = useMemo(() => {
    if (!isComplete) return null;
    const positives = Object.values(answers).filter((value) => positiveValues.has(value)).length;
    if (positives >= 4) {
      return "今日は十分がんばっています。その調子で。";
    }
    if (positives >= 2) {
      return "必要な分だけをこなせば大丈夫です。";
    }
    return "まずは休みましょう。呼吸を整えて、また明日。";
  }, [answers, isComplete]);

  const handleAnswer = (question: Question, value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(questions.length);
    }
  };

  const resetReview = () => {
    setAnswers({});
    setCurrentIndex(0);
  };

  const activeQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80" />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm sm:p-10">
          <p className="text-xs uppercase tracking-[0.4em] text-blue-500">review</p>
          <div className="mt-6 space-y-4">
            <h1 className="text-3xl font-bold leading-snug text-gray-900 sm:text-4xl">今日は、どうでしたか。</h1>
          </div>
        </section>

        {!isComplete && activeQuestion && (
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>質問 {currentIndex + 1} / {questions.length}</span>
              <span>{activeQuestion.category}</span>
            </div>
            <div className="mt-4 space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                    {activeQuestion.category.slice(0, 1)}
                  </span>
                  <p className="text-xl font-medium text-gray-900">{activeQuestion.text}</p>
                </div>
                <p className="text-sm text-gray-500">感覚に近いほうを選んでください。</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {activeQuestion.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAnswer(activeQuestion, option.value)}
                    className="rounded-2xl border border-gray-200 px-5 py-2 text-base text-gray-800 transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {isComplete && (
          <section className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10">
              <p className="text-xs uppercase tracking-[0.4em] text-blue-500">結果</p>
              <p className="mt-4 text-sm text-gray-500">今日は、これだけできています</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {questions.map((question) => {
                  const value = answers[question.id];
                  const isPositive = positiveValues.has(value);
                  const isUnknown = value === "unknown";
                  const color = isPositive ? "bg-emerald-100 text-emerald-700" : isUnknown ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500";
                  return (
                    <div key={question.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <div className={`size-9 rounded-full ${color} text-sm font-semibold flex items-center justify-center`}>
                        {question.category.slice(0, 1)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{question.category}</p>
                        <p className="text-xs text-gray-500">{value ? question.options.find((opt) => opt.value === value)?.label : "未回答"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-blue-50 bg-blue-50/60 p-6 text-center text-sm text-gray-600">
              <p className="text-base text-gray-700">
                {summary?.split("。").map((segment, index, arr) => {
                  if (!segment) return null;
                  const isLast = index === arr.length - 1;
                  return (
                    <span key={segment}>
                      {segment}
                      {!isLast && (
                        <>
                          。
                          <br className="sm:hidden" />
                        </>
                      )}
                    </span>
                  );
                })}
              </p>
              <button
                type="button"
                onClick={resetReview}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-blue-200 px-5 py-2 text-sm font-medium text-blue-700 transition hover:border-blue-300"
              >
                もう一度振り返る
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
