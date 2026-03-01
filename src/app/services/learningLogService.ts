import { useMemo } from "react";
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
  tagCounts: Record<PresetTag, number>;
  dailyCounts: Record<number, number>;
  logs: LearningLog[];
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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are not configured");
}

const SUPABASE_JWT_TEMPLATE = "supabase";

const mapRowToLog = (row: LearningLogRow): LearningLog => ({
  id: row.id,
  date: row.log_date,
  content: row.content,
  summary: row.summary ?? "",
  tags: row.tags ?? [],
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
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

    return getLogsBetween(
      weekStart.toISOString().split("T")[0],
      weekEnd.toISOString().split("T")[0]
    );
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
      weekStart: weekStart.toISOString().split("T")[0],
      weekEnd: weekEnd.toISOString().split("T")[0],
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
      monthStart.toISOString().split("T")[0],
      monthEnd.toISOString().split("T")[0]
    );

    const tagCounts: Record<PresetTag, number> = {
      英語: 0,
      システム開発: 0,
      PM: 0,
      機械学習: 0,
    };

    logs.forEach((log) => {
      log.tags.forEach((tag) => {
        if ((PRESET_TAGS as readonly string[]).includes(tag)) {
          const presetTag = tag as PresetTag;
          tagCounts[presetTag]++;
        }
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
  };
};

export type LearningLogService = ReturnType<typeof createService>;

export function useLearningLogService(): LearningLogService | null {
  const { getToken, userId } = useAuth();

  return useMemo(() => {
    if (!userId) return null;
    return createService({ getToken, userId });
  }, [getToken, userId]);
}
