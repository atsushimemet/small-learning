import { useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { useNavigate } from "react-router";
import { useAuth, useClerk } from "@clerk/clerk-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useScrollToTop } from "../hooks/useScrollToTop";

export function DeleteAccountPage() {
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  useScrollToTop();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token could not be retrieved");
      }

      const endpoint =
        (import.meta.env.VITE_DELETE_ACCOUNT_ENDPOINT as string | undefined)?.trim() ||
        "/api/delete-account";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Delete failed: ${response.status} ${text}`);
      }

      await signOut();
      navigate("/sign-in", { replace: true });
    } catch (error) {
      console.error(error);
      alert("アカウント削除に失敗しました。時間をおいて再度お試しください。");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80" />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
        <section className="space-y-4 text-left">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            アカウントを削除する
          </h1>
          <div className="text-sm leading-relaxed text-gray-600 sm:text-base">
            <p>アカウントを削除すると次のデータがすべて削除されます。</p>
            <ul className="mt-3 space-y-1 text-gray-700">
              <li>・学びログ</li>
              <li>・トリガー設定</li>
              <li>・アカウント情報</li>
            </ul>
            <p className="mt-4 font-medium text-gray-700">
              この操作は元に戻せません。
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-red-100 bg-red-50 p-6">
          <p className="text-sm text-red-600">注意</p>
          <p className="mt-2 text-base text-red-700">
            削除後は自動でログインページへ戻ります。再度ご利用の際はログインしてください。
          </p>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            アカウントを削除
          </button>
        </section>
      </main>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              本当にアカウントを削除しますか？
            </AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300"
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {isDeleting ? "削除中..." : "削除する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
