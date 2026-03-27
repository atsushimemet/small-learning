type GtagFunction = (command: string, eventName?: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: GtagFunction;
  }
}

const hasWindow = (): window is Window => typeof window !== "undefined";

const hasGtag = (): boolean => hasWindow() && typeof window.gtag === "function";

export const sendGtagEvent = (eventName: string, params: Record<string, unknown> = {}) => {
  if (!hasGtag()) {
    return false;
  }
  window.gtag!("event", eventName, params);
  return true;
};

export const sendPageView = (params: Record<string, unknown>) => {
  return sendGtagEvent("page_view", params);
};

export const getPageMetadata = () => {
  if (!hasWindow()) {
    return {};
  }

  return {
    page_path: window.location?.pathname,
    page_location: window.location?.href,
    page_title: typeof document !== "undefined" ? document.title : undefined,
  };
};
