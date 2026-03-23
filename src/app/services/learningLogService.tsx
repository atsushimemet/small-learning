import { createContext, useContext, useMemo, type PropsWithChildren } from "react";
import { useAuth } from "@clerk/clerk-react";
import { createClient } from "@supabase/supabase-js";

export const PRESET_TAGS = ["英語", "システム開発", "PM", "機械学習"] as const;
export type PresetTag = (typeof PRESET_TAGS)[number];
export type Tag = string;

export interface LearningLog {
  id: string;
  date: string;
  content: string;
  summary: string;
  tags: Tag[];
  createdAt: string;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  keyPoints: string[];
  unclearAreas: string[];
  totalLogs: number;
}

export interface MonthlyStats {
  totalLogs: number;
  tagCounts: Record<Tag, number>;
  dailyCounts: Record<number, number>;
  logs: LearningLog[];
}

export interface DailyGoal {
  id: string;
  date: string;
  doGoal: string;
  notGoal: string;
  createdAt: string;
}

interface LearningLogRow {
  id: string;
  user_id: string;
  log_date: string;
  content: string;
  summary: string | null;
  tags: Tag[] | null;
  created_at: string;
}

interface DailyGoalRow {
  id: string;
  user_id: string;
  date: string;
  do_goal: string | null;
  not_goal: string | null;
  created_at: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_JWT_TEMPLATE = "supabase";

const getSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured");
  }
  return { supabaseUrl, supabaseAnonKey } as const;
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const mapRowToLog = (row: LearningLogRow): LearningLog => ({
  id: row.id,
  date: row.log_date,
  content: row.content,
  summary: row.summary ?? "",
  tags: row.tags ?? [],
  createdAt: row.created_at,
});

const mapRowToDailyGoal = (row: DailyGoalRow): DailyGoal => ({
  id: row.id,
  date: row.date,
  doGoal: row.do_goal ?? "",
  notGoal: row.not_goal ?? "",
  createdAt: row.created_at,
});

interface ServiceOptions {
  getToken: ReturnType<typeof useAuth>["getToken"];
  userId: string;
}

const createService = ({ getToken, userId }: ServiceOptions) => {
  const ensureAuth = async () => {
    const token = await getToken({ template: SUPABASE_JWT_TEMPLATE });
    if (!token) {
      throw new Error("Supabase access token could not be retrieved");
    }
    const { supabaseUrl: url, supabaseAnonKey: anonKey } = getSupabaseConfig();
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    return { supabase, userId };
  };

  const getAllLogs = async () => {
    const { supabase, userId } = await ensureAuth();
    const { data, error } = await supabase
      .from("learning_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .order("log_date", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapRowToLog);
  };

  const addLog = async (
    log: Omit<LearningLog, "id" | "createdAt">
  ): Promise<LearningLog> => {
    const { supabase, userId } = await ensureAuth();
    const payload = {
      user_id: userId,
      log_date: log.date,
      content: log.content,
      summary: log.summary,
      tags: log.tags,
    };

    const { data, error } = await supabase
      .from("learning_logs")
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      throw error ?? new Error("学習ログの保存に失敗しました");
    }

    return mapRowToLog(data as LearningLogRow);
  };

  const getLogsByTag = async (tag: Tag) => {
    const { supabase, userId } = await ensureAuth();
    const { data, error } = await supabase
      .from("learning_logs")
      .select("*")
      .eq("user_id", userId)
      .contains("tags", [tag])
      .order("created_at", { ascending: false })
      .order("log_date", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapRowToLog);
  };

  const searchLogs = async (query: string) => {
    const { supabase, userId } = await ensureAuth();
    const likeQuery = `%${query}%`;
    const { data, error } = await supabase
      .from("learning_logs")
      .select("*")
      .eq("user_id", userId)
      .or(`content.ilike.${likeQuery},summary.ilike.${likeQuery}`)
      .order("created_at", { ascending: false })
      .order("log_date", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapRowToLog);
  };

  const getLogsBetween = async (startDate: string, endDate: string) => {
    const { supabase, userId } = await ensureAuth();
    const { data, error } = await supabase
      .from("learning_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", startDate)
      .lte("log_date", endDate)
      .order("created_at", { ascending: false })
      .order("log_date", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapRowToLog);
  };

  const getCurrentWeekLogs = async () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return getLogsBetween(formatDate(weekStart), formatDate(weekEnd));
  };

  const generateWeeklySummary = async (): Promise<WeeklySummary | null> => {
    const weekLogs = await getCurrentWeekLogs();
    if (weekLogs.length === 0) return null;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const keyPoints = weekLogs
      .slice(0, 5)
      .map((log) => log.summary)
      .filter(Boolean);

    const tagCounts: Record<PresetTag, number> = {
      英語: 0,
      システム開発: 0,
      PM: 0,
      機械学習: 0,
    };

    weekLogs.forEach((log) => {
      log.tags.forEach((tag) => {
        if ((PRESET_TAGS as readonly string[]).includes(tag)) {
          const presetTag = tag as PresetTag;
          tagCounts[presetTag] = (tagCounts[presetTag] || 0) + 1;
        }
      });
    });

    const unclearAreas = Object.entries(tagCounts)
      .filter(([_, count]) => count < 2)
      .map(([tag]) => `${tag}の学習時間が少ない可能性があります`);

    return {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      keyPoints,
      unclearAreas:
        unclearAreas.length > 0
          ? unclearAreas
          : ["順調に学習を進められています！"],
      totalLogs: weekLogs.length,
    };
  };

  const getMonthlyStats = async (year: number, month: number): Promise<MonthlyStats> => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const logs = await getLogsBetween(
      formatDate(monthStart),
      formatDate(monthEnd)
    );

    const tagCounts: Record<Tag, number> = {};
    logs.forEach((log) => {
      log.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      });
    });

    const dailyCounts: Record<number, number> = {};
    logs.forEach((log) => {
      const day = new Date(log.date).getDate();
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    return {
      totalLogs: logs.length,
      tagCounts,
      dailyCounts,
      logs,
    };
  };

  const getUserTags = async (): Promise<Tag[]> => {
    const { supabase, userId } = await ensureAuth();
    const { data, error } = await supabase
      .from("learning_tags")
      .select("name")
      .eq("user_id", userId)
      .order("name");

    if (error) throw error;

    return (data ?? []).map((row) => row.name as Tag);
  };

  const addUserTag = async (name: string): Promise<void> => {
    const normalized = name.trim();
    if (!normalized) return;
    const existingTags = await getUserTags();
    if (existingTags.includes(normalized)) return;

    const { supabase, userId } = await ensureAuth();
    const { error } = await supabase.from("learning_tags").insert({
      user_id: userId,
      name: normalized,
    });
    if (error && error.code !== "23505") {
      throw error;
    }
  };

  const getLogsForDate = async (date: string) => {
    return getLogsBetween(date, date);
  };

  const saveLearningTrigger = async ({
    triggerType,
    triggerValue,
  }: {
    triggerType: "preset" | "custom";
    triggerValue: string;
  }) => {
    const { supabase, userId } = await ensureAuth();
    const { error } = await supabase
      .from("learning_triggers")
      .upsert(
        {
          user_id: userId,
          trigger_type: triggerType,
          trigger_value: triggerValue,
        },
        { onConflict: "user_id" }
      );
    if (error) throw error;
  };

  const getLearningTrigger = async (): Promise<{
    triggerType: "preset" | "custom";
    triggerValue: string;
  } | null> => {
    const { supabase, userId } = await ensureAuth();
    const { data, error } = await supabase
      .from("learning_triggers")
      .select("trigger_type, trigger_value")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      triggerType: data.trigger_type as "preset" | "custom",
      triggerValue: data.trigger_value,
    };
  };

  const getDailyGoalForDate = async (date: string): Promise<DailyGoal | null> => {
    const { supabase, userId } = await ensureAuth();
    const { data, error } = await supabase
      .from("dailygoal")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return mapRowToDailyGoal(data as DailyGoalRow);
  };

  const saveDailyGoal = async ({
    date,
    doGoal,
    notGoal,
  }: {
    date: string;
    doGoal: string;
    notGoal: string;
  }) => {
    const { supabase, userId } = await ensureAuth();
    const payload = {
      user_id: userId,
      date,
      do_goal: doGoal || null,
      not_goal: notGoal || null,
    };
    const { error } = await supabase
      .from("dailygoal")
      .upsert(payload, { onConflict: "user_id,date" });

    if (error) throw error;
  };

  return {
    getAllLogs,
    addLog,
    getLogsByTag,
    searchLogs,
    getCurrentWeekLogs,
    generateWeeklySummary,
    getMonthlyStats,
    getUserTags,
    addUserTag,
    getLogsForDate,
    saveLearningTrigger,
    getLearningTrigger,
    getDailyGoalForDate,
    saveDailyGoal,
  };
};

export type LearningLogService = ReturnType<typeof createService>;

const LearningLogServiceContext = createContext<LearningLogService | null>(null);

interface LearningLogServiceProviderProps extends PropsWithChildren {
  service?: LearningLogService | null;
}

export function LearningLogServiceProvider({ children, service }: LearningLogServiceProviderProps) {
  const { getToken, userId } = useAuth();

  const authService = useMemo(() => {
    if (!userId) return null;
    return createService({ getToken, userId });
  }, [getToken, userId]);

  const value = service ?? authService;

  return (
    <LearningLogServiceContext.Provider value={value}>
      {children}
    </LearningLogServiceContext.Provider>
  );
}

export function useLearningLogService(): LearningLogService | null {
  return useContext(LearningLogServiceContext);
}

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export const createGuestLearningLogService = (): LearningLogService => {
  let logs: LearningLog[] = [];
  const customTags = new Set<Tag>();
  const dailyGoals = new Map<string, DailyGoal>();

  const cloneLogs = (source: LearningLog[]) =>
    source.map((log) => ({ ...log, tags: [...log.tags] }));

  const sortByCreatedAtDesc = (source: LearningLog[]) =>
    [...source].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const getAllLogs = async () => sortByCreatedAtDesc(cloneLogs(logs));

  const addLog = async (
    log: Omit<LearningLog, "id" | "createdAt">
  ): Promise<LearningLog> => {
    const entry: LearningLog = {
      ...log,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    logs = [entry, ...logs];
    return entry;
  };

  const getLogsBetween = async (startDate: string, endDate: string) => {
    const filtered = logs.filter(
      (log) => log.date >= startDate && log.date <= endDate
    );
    return sortByCreatedAtDesc(cloneLogs(filtered));
  };

  const getLogsByTag = async (tag: Tag) => {
    const filtered = logs.filter((log) => log.tags.includes(tag));
    return sortByCreatedAtDesc(cloneLogs(filtered));
  };

  const searchLogs = async (query: string) => {
    const normalized = query.trim().toLowerCase();
    const filtered = logs.filter(
      (log) =>
        log.content.toLowerCase().includes(normalized) ||
        log.summary.toLowerCase().includes(normalized)
    );
    return sortByCreatedAtDesc(cloneLogs(filtered));
  };

  const getCurrentWeekLogs = async () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return getLogsBetween(formatDate(weekStart), formatDate(weekEnd));
  };

  const generateWeeklySummary = async (): Promise<WeeklySummary | null> => {
    const weekLogs = await getCurrentWeekLogs();
    if (weekLogs.length === 0) return null;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const keyPoints = weekLogs
      .slice(0, 5)
      .map((log) => log.summary)
      .filter(Boolean);

    const tagCounts: Record<PresetTag, number> = {
      英語: 0,
      システム開発: 0,
      PM: 0,
      機械学習: 0,
    };

    weekLogs.forEach((log) => {
      log.tags.forEach((tag) => {
        if ((PRESET_TAGS as readonly string[]).includes(tag)) {
          const presetTag = tag as PresetTag;
          tagCounts[presetTag] = (tagCounts[presetTag] || 0) + 1;
        }
      });
    });

    const unclearAreas = Object.entries(tagCounts)
      .filter(([_, count]) => count < 2)
      .map(([tag]) => `${tag}の学習時間が少ない可能性があります`);

    return {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(weekEnd),
      keyPoints,
      unclearAreas:
        unclearAreas.length > 0
          ? unclearAreas
          : ["順調に学習を進められています！"],
      totalLogs: weekLogs.length,
    };
  };

  const getMonthlyStats = async (year: number, month: number): Promise<MonthlyStats> => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const periodLogs = await getLogsBetween(
      formatDate(monthStart),
      formatDate(monthEnd)
    );

    const tagCounts: Record<Tag, number> = {};
    periodLogs.forEach((log) => {
      log.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      });
    });

    const dailyCounts: Record<number, number> = {};
    periodLogs.forEach((log) => {
      const day = new Date(log.date).getDate();
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    return {
      totalLogs: periodLogs.length,
      tagCounts,
      dailyCounts,
      logs: periodLogs,
    };
  };

  const getUserTags = async (): Promise<Tag[]> => Array.from(customTags);

  const addUserTag = async (name: string): Promise<void> => {
    const normalized = name.trim();
    if (!normalized) return;
    customTags.add(normalized);
  };

  const getLogsForDate = async (date: string) => getLogsBetween(date, date);

  const saveLearningTrigger = async ({
    triggerType,
    triggerValue,
  }: {
    triggerType: "preset" | "custom";
    triggerValue: string;
  }) => {
    console.log("Guest trigger", { triggerType, triggerValue });
  };

  const getLearningTrigger = async () => null;

  const getDailyGoalForDate = async (date: string) => {
    const goal = dailyGoals.get(date);
    return goal ? { ...goal } : null;
  };

  const saveDailyGoal = async ({
    date,
    doGoal,
    notGoal,
  }: {
    date: string;
    doGoal: string;
    notGoal: string;
  }) => {
    const existing = dailyGoals.get(date);
    const entry: DailyGoal = {
      id: existing?.id ?? generateId(),
      date,
      doGoal,
      notGoal,
      createdAt: new Date().toISOString(),
    };
    dailyGoals.set(date, entry);
  };

  return {
    getAllLogs,
    addLog,
    getLogsByTag,
    searchLogs,
    getCurrentWeekLogs,
    generateWeeklySummary,
    getMonthlyStats,
    getUserTags,
    addUserTag,
    getLogsForDate,
    saveLearningTrigger,
    getLearningTrigger,
    getDailyGoalForDate,
    saveDailyGoal,
  };
};
