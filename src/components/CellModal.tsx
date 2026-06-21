"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X, MessageSquare, Paperclip, Lightbulb, ThumbsUp, Star, ExternalLink } from "lucide-react";
import { CellData } from "@/types";

interface Props {
  rowLabel: string;
  colLabel: string;
  cellData: CellData;
  onClose: () => void;
}

type Tab = "tasks" | "comments" | "attachments";

const REACTIONS = [
  { key: "idea" as const, emoji: "💡", label: "アイデア！", icon: Lightbulb, cls: "border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
  { key: "good" as const, emoji: "👍", label: "参考になった", icon: ThumbsUp, cls: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100" },
  { key: "want" as const, emoji: "⭐", label: "やってみたい", icon: Star, cls: "border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100" },
];

export default function CellModal({ rowLabel, colLabel, cellData, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("tasks");
  const [data, setData] = useState<CellData>(cellData);
  const [newComment, setNewComment] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const addComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    setData((prev) => ({
      ...prev,
      comments: [
        ...prev.comments,
        {
          id: Date.now().toString(),
          author: "自分",
          content: trimmed,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    setNewComment("");
  };

  const addReaction = (key: keyof typeof data.reactions) => {
    setData((prev) => ({
      ...prev,
      reactions: { ...prev.reactions, [key]: prev.reactions[key] + 1 },
    }));
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">
              {rowLabel} › {colLabel}
            </p>
            <h2 className="text-lg font-bold text-gray-900">AI活用アイデア</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Summary */}
        {data.aiSummary && (
          <div className="mx-6 mt-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
            <span className="font-semibold">AI まとめ:</span> {data.aiSummary}
          </div>
        )}

        {/* Reactions */}
        <div className="flex gap-2 px-6 py-3">
          {REACTIONS.map((r) => {
            const count = data.reactions[r.key];
            return (
              <button
                key={r.key}
                onClick={() => addReaction(r.key)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${r.cls}`}
              >
                {r.emoji} {r.label}
                {count > 0 && (
                  <span className="ml-0.5 font-bold">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          {(
            [
              { key: "tasks", label: "業務内容", count: data.tasks.length },
              { key: "comments", label: "AI活用アイデア", count: data.comments.length },
              { key: "attachments", label: "添付ファイル", count: data.attachments.length },
            ] as { key: Tab; label: string; count: number }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={[
                "flex items-center gap-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px",
                tab === t.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700",
              ].join(" ")}
            >
              {t.key === "comments" && <MessageSquare className="w-3.5 h-3.5" />}
              {t.key === "attachments" && <Paperclip className="w-3.5 h-3.5" />}
              {t.label}
              {t.count > 0 && (
                <span className="ml-1 text-[10px] bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Tasks */}
          {tab === "tasks" && (
            <div>
              {data.tasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  業務内容はまだ登録されていません
                  <br />
                  <span className="text-xs">businessMap.json の tasks に追加してください</span>
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-300 mt-0.5 select-none">●</span>
                      <div>
                        <p className="text-sm text-gray-800">{task.label}</p>
                        {task.owner && (
                          <p className="text-xs text-gray-400 mt-0.5">担当: {task.owner}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Comments */}
          {tab === "comments" && (
            <div className="space-y-4">
              {data.comments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                  まだアイデアがありません。最初の一件を投稿しましょう！
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.comments.map((c) => (
                    <li key={c.id} className="p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-blue-700">{c.author}</span>
                        <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{c.content}</p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-t pt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addComment();
                  }}
                  placeholder="AI活用のアイデアや気づきを入稿してください…（Cmd+Enter で投稿）"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  投稿する
                </button>
              </div>
            </div>
          )}

          {/* Attachments */}
          {tab === "attachments" && (
            <div className="space-y-3">
              {data.attachments.length === 0 ? (
                <div className="text-center py-8">
                  <Paperclip className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">添付ファイルはまだありません</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {data.attachments.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">
                        {f.type === "html" ? "🌐" : f.type === "pdf" ? "📕" : "📄"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline truncate block"
                        >
                          {f.name}
                        </a>
                        <p className="text-xs text-gray-400">{formatDate(f.uploadedAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* AI活用事例ページへのリンク */}
              <Link
                href="/resources"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors"
                onClick={() => {/* モーダルを閉じる場合は onClose を呼ぶ */}}
              >
                <ExternalLink className="w-4 h-4" />
                AI活用事例・手順書ページでHTMLをアップロード
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
