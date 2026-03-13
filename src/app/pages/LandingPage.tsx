import { Link } from "react-router";
import { ArrowRight, Check, PenSquare, Tag, Type } from "lucide-react";

const pains = [
  "一日が会議と社内調整で埋まる",
  "仕様調整と合意形成のメモに追われる",
  "Slackとドキュメントの返信が止まらない",
];

const values = [
  { title: "学習習慣が戻る", description: "ミニマムなアウトプットから再開できます。" },
  { title: "思考が澄む", description: "要約のプロセスで次の一手が見えるようになる。" },
  { title: "知識が積み上がる", description: "タグ化でログが体系化され、再利用しやすくなる。" },
];

const steps = [
  {
    icon: PenSquare,
    title: "140文字で書く",
    description: "今日触れた視点や気づきをラフに書き出す。",
  },
  {
    icon: Type,
    title: "20文字で要約",
    description: "本質だけを残して思考を整える。",
  },
  {
    icon: Tag,
    title: "タグを添える",
    description: "ジャンルを紐付けて知識を育てる。",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-b from-blue-50 to-white p-6 shadow-sm sm:p-10">
          <p className="text-sm text-blue-600">ちいさな学び</p>
          <div className="mt-5 space-y-4">
            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
              一日中、社内調整。会議、合意形成、Slack返信。
            </p>
            <div className="space-y-1">
              <p className="text-2xl	font-semibold text-gray-900 sm:text-3xl">気づけば、学習が止まっていませんか。</p>
              <p className="text-xs text-gray-500 sm:text-sm">PM / プロダクトデザイナー / Webマーケターのための</p>
              <h1 className="text-3xl font-bold text-blue-700 sm:text-4xl">1分アウトプット学習</h1>
            </div>
          </div>
        </section>

        {/* Pain */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-gray-500">こんな状況が続いていませんか</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {pains.map((pain) => (
              <div key={pain} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-base text-gray-700">{pain}</p>
              </div>
            ))}
          </div>
          <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
            本当はプロダクト、マーケティング、AI、UXなど学ぶべきテーマが山ほどあるのに、気づけば「今日は何も学んでいない」という日が続く。
          </p>
        </section>

        {/* Problem */}
        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-inner space-y-3 sm:p-8">
          <p className="text-sm font-semibold text-blue-600">問題の本質</p>
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">学習が続かない理由は時間の不足ではなく、アウトプットの仕組みがないこと。</h2>
          <p className="text-base text-gray-600">
            忙しい日々でも、思考を留める場所さえあれば学びは自然と戻ってくる。そこで私たちは「1分で書けるアウトプット習慣」を提供します。
          </p>
        </section>

        {/* Solution */}
        <section className="space-y-5">
          <h2 className="text-center text-sm font-semibold text-gray-500">1分で終わるアウトプット</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <step.icon className="size-9 text-blue-600" />
                <p className="mt-3 text-lg font-semibold text-gray-900">{step.title}</p>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold text-gray-500">得られる価値</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {values.map((value) => (
              <div key={value.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600">
                  <Check className="size-4" />
                  <p className="text-sm font-semibold">{value.title}</p>
                </div>
                <p className="mt-3 text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 sm:text-base">
            仕事の合間でも続けられる、静かな1分の知的トレーニングです。
          </p>
        </section>

        {/* CTA */}
        <section className="space-y-4 rounded-3xl border border-blue-100 bg-white p-7 text-center shadow-sm sm:p-9">
          <p className="text-xs uppercase tracking-[0.4em] text-blue-500 sm:text-sm">start</p>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            今日の学びを、
            <span className="whitespace-nowrap">1分で残す。</span>
          </h2>
          <p className="text-sm text-gray-600 sm:text-base">穏やかに学習習慣を取り戻したい方へ。</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/trial"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-500"
            >
              無料で始める
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-base font-semibold text-gray-700 transition hover:border-gray-300"
            >
              アカウント作成
            </Link>
          </div>
          <p className="text-xs text-gray-500">
            ログイン不要ですぐに体験できます。ページを離れるとデータは削除されます。
          </p>
        </section>
      </main>
    </div>
  );
}
