const FLOW_KEY = "flow";

export type FlowValue = "lp" | "lp_trial";

const hasSessionStorage = () =>
  typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

export const setFlow = (value: FlowValue) => {
  if (!hasSessionStorage()) return;
  try {
    window.sessionStorage.setItem(FLOW_KEY, value);
  } catch {
    // Access to sessionStorage can fail in private mode
  }
};

export const getFlow = (): FlowValue | "unknown" => {
  if (!hasSessionStorage()) {
    return "unknown";
  }
  try {
    const stored = window.sessionStorage.getItem(FLOW_KEY);
    if (stored === "lp" || stored === "lp_trial") {
      return stored;
    }
    return "unknown";
  } catch {
    return "unknown";
  }
};

export const clearFlow = () => {
  if (!hasSessionStorage()) return;
  try {
    window.sessionStorage.removeItem(FLOW_KEY);
  } catch {
    // ignore
  }
};
