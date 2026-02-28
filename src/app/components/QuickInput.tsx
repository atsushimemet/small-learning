import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import {
  useLearningLogService,
  learningLogServiceHelpers,
  type Tag,
} from "../services/learningLogService";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

const AVAILABLE_TAGS: Tag[] = ["英語", "システム開発", "PM", "機械学習"];

export function QuickInput({ onLogAdded }: { onLogAdded?: () => void }) {
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const learningLogService = useLearningLogService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("学んだことを入力してください");
      return;
    }

    if (!summary.trim()) {
      toast.error("一言要約を入力してください");
      return;
    }

    if (selectedTags.length === 0) {
      toast.error("タグを1つ以上選択してください");
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      if (!learningLogService) {
        toast.error("認証情報を取得しています。少し待ってから再度お試しください。");
        return;
      }

      await learningLogService.addLog({
        date: today,
        content: content.trim(),
        summary: summary.trim(),
        tags: selectedTags,
      });

      toast.success("学習ログを保存しました！");
      setContent("");
      setSummary("");
      setSelectedTags([]);
      onLogAdded?.();
    } catch (error) {
      toast.error("保存に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAutoTag = () => {
    const suggestedTags = learningLogServiceHelpers.autoTag(content);
    if (suggestedTags.length > 0) {
      setSelectedTags(suggestedTags);
      toast.success(`タグを自動設定しました: ${suggestedTags.join(", ")}`);
    } else {
      toast.info("関連するタグが見つかりませんでした");
    }
  };

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm text-gray-700">
              今日学んだこと
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今日の学習内容を記録しましょう..."
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-700">
              一言要約
            </label>
            <Input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="学んだことを一言で"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-700">タグ</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAutoTag}
                disabled={!content.trim() || isSubmitting}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                <Plus className="size-3 mr-1" />
                自動タグ付け
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:border-blue-400"
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && (
                    <X className="ml-1 size-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "保存中..." : "学習ログを保存"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
