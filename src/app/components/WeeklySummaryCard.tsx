import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { learningLogService } from "../services/learningLogService";

export function WeeklySummaryCard() {
  const summary = learningLogService.generateWeeklySummary();

  if (!summary) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5 text-blue-600" />
            週次サマリ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            今週の学習ログがまだありません。最初の記録を追加しましょう！
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="size-5 text-blue-600" />
          週次サマリ
        </CardTitle>
        <p className="text-sm text-gray-600">
          {new Date(summary.weekStart).toLocaleDateString("ja-JP", {
            month: "long",
            day: "numeric",
          })}{" "}
          〜{" "}
          {new Date(summary.weekEnd).toLocaleDateString("ja-JP", {
            month: "long",
            day: "numeric",
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="size-4 text-green-600" />
            <h4 className="text-sm font-medium">要点</h4>
          </div>
          {summary.keyPoints.length > 0 ? (
            <ul className="space-y-1">
              {summary.keyPoints.map((point, idx) => (
                <li key={idx} className="text-sm text-gray-700 pl-4">
                  • {point}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 pl-4">要点がありません</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="size-4 text-amber-600" />
            <h4 className="text-sm font-medium">未理解領域・改善点</h4>
          </div>
          <ul className="space-y-1">
            {summary.unclearAreas.map((area, idx) => (
              <li key={idx} className="text-sm text-gray-700 pl-4">
                • {area}
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t border-blue-100">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            今週の記録数: {summary.totalLogs}件
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
