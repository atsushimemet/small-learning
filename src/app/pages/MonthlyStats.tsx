import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { BottomNav } from "../components/BottomNav";
import { learningLogService, type Tag } from "../services/learningLogService";
import { BarChart3, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const TAG_COLORS: Record<Tag, string> = {
  英語: "#3b82f6",
  システム開発: "#10b981",
  PM: "#f59e0b",
  機械学習: "#8b5cf6",
};

export function MonthlyStats() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState<any>(null);

  const loadStats = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const data = learningLogService.getMonthlyStats(year, month);
    setStats(data);
  };

  useEffect(() => {
    loadStats();
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const monthName = currentDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  // Prepare data for charts
  const tagChartData = stats
    ? Object.entries(stats.tagCounts).map(([tag, count]) => ({
        name: tag,
        value: count as number,
      }))
    : [];

  const dailyChartData = stats
    ? Object.entries(stats.dailyCounts)
        .map(([day, count]) => ({
          day: parseInt(day),
          count: count as number,
        }))
        .sort((a, b) => a.day - b.day)
    : [];

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-8 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">月次レポート</h1>
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
          <p className="text-gray-600">学習の進捗を可視化</p>
        </header>

        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              className="shrink-0"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {monthName}
              </h2>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              className="shrink-0"
              disabled={
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()
              }
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {!stats || stats.totalLogs === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <p className="text-center text-sm text-gray-500">
                この月の学習ログがありません
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle>概要</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-600 text-white">
                    合計 {stats.totalLogs}件の記録
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-100">
              <CardHeader>
                <CardTitle>カテゴリ別学習回数</CardTitle>
              </CardHeader>
              <CardContent>
                {tagChartData.some((d) => d.value > 0) ? (
                  <>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={tagChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) =>
                            value > 0 ? `${name}: ${value}` : ""
                          }
                        >
                          {tagChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                TAG_COLORS[entry.name as Tag] || "#94a3b8"
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      {tagChartData
                        .filter((d) => d.value > 0)
                        .map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2"
                          >
                            <div
                              className="size-3 rounded-full"
                              style={{
                                backgroundColor:
                                  TAG_COLORS[item.name as Tag] || "#94a3b8",
                              }}
                            />
                            <span className="text-sm text-gray-700">
                              {item.name}: {item.value}回
                            </span>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    データがありません
                  </p>
                )}
              </CardContent>
            </Card>

            {dailyChartData.length > 0 && (
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle>日別学習記録数</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dailyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="day"
                        label={{ value: "日", position: "insideBottom", offset: -5 }}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value}件`, "記録数"]}
                      />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
