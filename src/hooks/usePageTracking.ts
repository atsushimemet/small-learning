import { useEffect, useState } from "react";
import type { Router } from "react-router";
import { getPageMetadata, sendGtagEvent, sendPageView } from "../utils/gtag";

const isBrowser = () => typeof window !== "undefined";

export const usePageTracking = (router: Router) => {
  const [pathname, setPathname] = useState(router.state.location.pathname);

  useEffect(() => {
    return router.subscribe((state) => {
      setPathname(state.location.pathname);
    });
  }, [router]);

  useEffect(() => {
    if (!isBrowser()) return;

    const metadata = getPageMetadata();
    sendPageView({
      ...metadata,
      page_path: pathname,
    });
  }, [pathname]);

  useEffect(() => {
    if (!isBrowser() || pathname !== "/lp") return;

    const start = typeof performance !== "undefined" ? performance.now() : Date.now();
    let maxScroll = 0;

    const updateScrollDepth = () => {
      if (typeof document === "undefined") return;
      const doc = document.documentElement;
      const body = document.body;
      if (!doc || !body) return;

      const scrollTop = window.scrollY ?? doc.scrollTop ?? body.scrollTop ?? 0;
      const scrollHeight = doc.scrollHeight ?? body.scrollHeight ?? 0;
      const clientHeight = doc.clientHeight ?? window.innerHeight ?? 0;
      const scrollable = scrollHeight - clientHeight;
      const depth = scrollable > 0 ? (scrollTop / scrollable) * 100 : 100;
      if (depth > maxScroll) {
        maxScroll = Math.min(100, depth);
      }
    };

    window.addEventListener("scroll", updateScrollDepth, { passive: true });
    updateScrollDepth();

    return () => {
      window.removeEventListener("scroll", updateScrollDepth);
      const end = typeof performance !== "undefined" ? performance.now() : Date.now();
      const dwellTimeMs = Math.max(0, Math.round(end - start));

      sendGtagEvent("lp_dwell", {
        page_path: "/lp",
        dwell_time_ms: dwellTimeMs,
      });

      sendGtagEvent("lp_scroll", {
        page_path: "/lp",
        max_scroll_percent: Math.round(maxScroll),
      });
    };
  }, [pathname]);
};
