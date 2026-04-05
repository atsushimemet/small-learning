import { useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { getPageMetadata, sendGtagEvent } from "../../utils/gtag";
import { setFlow } from "../../utils/flowTracking";

export function LandingPage() {
  useScrollToTop();
  useEffect(() => {
    setFlow("lp");
    sendGtagEvent("lp_view", {
      ...getPageMetadata(),
      page_path: "/lp",
    });
  }, []);
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
        <div className="flex w-full max-w-[22rem] flex-col items-center space-y-8 text-center sm:max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">ちいさな学び</p>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              1分の学習メモで
              <br />
              バーンアウトから復活
            </h1>
            <p className="text-base leading-relaxed text-gray-600 sm:text-lg">
              疲れてしまったPMが、1分の学習メモで
              <br />
              自信を取り戻すための場所です。
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
            {["PM", "リーダー", "バーンアウト", "回復"].map((topic) => (
              <span key={topic} className="rounded-full border border-gray-200 px-3 py-1">
                {topic}
              </span>
            ))}
          </div>
          <div className="w-full space-y-3">
            <Link
              to="/trial"
              className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-blue-500"
            >
              無料で体験する
              <ArrowRight className="ml-2 size-5" />
            </Link>
            <Link
              to="/sign-up"
              className="inline-flex w-full items-center justify-center rounded-full border border-gray-200 px-6 py-3 text-base font-semibold text-gray-700 transition hover:border-gray-300"
            >
              アカウントを作成
            </Link>
          </div>
          <div className="space-y-1 text-sm text-gray-500">
            <p>毎日1分の学習メモで自己肯定感を積み直す</p>
            <p className="text-xs text-gray-400">体験なら登録不要</p>
          </div>
        </div>
      </main>
    </div>
  );
}
