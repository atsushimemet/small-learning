import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Wind, NotepadText, Repeat, Trash2, SunMedium } from "lucide-react";

export function HamburgerMenu() {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [open]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
                aria-label="メニューを開く"
                aria-expanded={open}
            >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            {open && (
                <div className="absolute right-0 mt-3 w-60 space-y-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-2xl">
                    <Link
                        to="/reset"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                        <Wind className="size-4 text-blue-500" />
                        <span className="font-medium text-gray-900">手放すページ</span>
                    </Link>
                    <Link
                        to="/review"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                        <NotepadText className="size-4 text-emerald-500" />
                        <span className="font-medium text-gray-900">振り返りページ</span>
                    </Link>
                    <Link
                        to="/ifthen"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                        <Repeat className="size-4 text-purple-500" />
                        <span className="font-medium text-gray-900">習慣トリガーを決める</span>
                    </Link>
                    <Link
                        to="/dailygoal"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                        <SunMedium className="size-4 text-amber-500" />
                        <span className="font-medium text-gray-900">今日の目標を決める</span>
                    </Link>
                    <Link
                        to="/delete"
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    >
                        <Trash2 className="size-4 text-red-500" />
                        <span className="font-medium text-red-600">削除ページ</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
