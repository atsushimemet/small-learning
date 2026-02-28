export type Tag = "英語" | "システム開発" | "PM" | "機械学習";

export interface LearningLog {
  id: string;
  date: string;
  content: string;
  summary: string;
  tags: Tag[];
  createdAt: number;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  keyPoints: string[];
  unclearAreas: string[];
  totalLogs: number;
}

const STORAGE_KEY = "learning_logs";

export const learningLogService = {
  // Get all logs
  getAllLogs(): LearningLog[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Add a new log
  addLog(log: Omit<LearningLog, "id" | "createdAt">): LearningLog {
    const logs = this.getAllLogs();
    const newLog: LearningLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return newLog;
  },

  // Get logs by tag
  getLogsByTag(tag: Tag): LearningLog[] {
    return this.getAllLogs().filter((log) => log.tags.includes(tag));
  },

  // Search logs
  searchLogs(query: string): LearningLog[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllLogs().filter(
      (log) =>
        log.content.toLowerCase().includes(lowerQuery) ||
        log.summary.toLowerCase().includes(lowerQuery)
    );
  },

  // Get logs for current week
  getCurrentWeekLogs(): LearningLog[] {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return this.getAllLogs().filter((log) => {
      const logDate = new Date(log.date);
      return logDate >= weekStart;
    });
  },

  // Generate weekly summary
  generateWeeklySummary(): WeeklySummary | null {
    const weekLogs = this.getCurrentWeekLogs();
    if (weekLogs.length === 0) return null;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Extract key points from summaries
    const keyPoints = weekLogs
      .slice(0, 5)
      .map((log) => log.summary)
      .filter(Boolean);

    // Generate unclear areas based on tags with fewer logs
    const tagCounts: Record<string, number> = {};
    weekLogs.forEach((log) => {
      log.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
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
  },

  // Get monthly stats
  getMonthlyStats(year: number, month: number) {
    const logs = this.getAllLogs().filter((log) => {
      const logDate = new Date(log.date);
      return logDate.getFullYear() === year && logDate.getMonth() === month;
    });

    const tagCounts: Record<Tag, number> = {
      英語: 0,
      システム開発: 0,
      PM: 0,
      機械学習: 0,
    };

    logs.forEach((log) => {
      log.tags.forEach((tag) => {
        tagCounts[tag]++;
      });
    });

    // Daily log counts
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
  },

  // Auto-tag based on content (simple keyword matching)
  autoTag(content: string): Tag[] {
    const tags: Tag[] = [];
    const lowerContent = content.toLowerCase();

    const keywords: Record<Tag, string[]> = {
      英語: ["english", "英語", "toeic", "vocabulary", "grammar", "英会話"],
      システム開発: [
        "react",
        "typescript",
        "javascript",
        "開発",
        "コード",
        "プログラミング",
        "api",
        "database",
        "git",
      ],
      PM: ["プロジェクト", "マネジメント", "pm", "アジャイル", "スクラム", "kpi"],
      機械学習: [
        "機械学習",
        "ml",
        "ai",
        "deep learning",
        "neural network",
        "python",
        "tensorflow",
        "pytorch",
      ],
    };

    (Object.keys(keywords) as Tag[]).forEach((tag) => {
      if (keywords[tag].some((keyword) => lowerContent.includes(keyword))) {
        tags.push(tag);
      }
    });

    return tags;
  },
};
