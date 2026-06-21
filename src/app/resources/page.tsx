"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Upload, ExternalLink, FileText, ArrowLeft } from "lucide-react";

interface UploadedFile {
  key: string;
  name: string;
  url: string;
  uploadedAt: string;
  size: number;
}

const API_URL = process.env.NEXT_PUBLIC_UPLOAD_API_URL;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ResourcesPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    if (!API_URL) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setFiles(data.files ?? []);
    } catch {
      setError("ファイル一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !API_URL) return;

    setUploading(true);
    setError(null);
    try {
      // 1. プリサインURLを取得
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "text/html",
        }),
      });
      const { uploadUrl, key, publicUrl } = await res.json();

      // 2. S3 へ直接アップロード
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "text/html" },
      });

      // 3. リストに追加
      setFiles((prev) => [
        {
          key,
          name: file.name,
          url: publicUrl,
          uploadedAt: new Date().toISOString(),
          size: file.size,
        },
        ...prev,
      ]);
    } catch {
      setError("アップロードに失敗しました。ネットワークまたはAPI設定を確認してください。");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 業務マップに戻る
            </Link>
            <h1 className="text-xl font-bold text-gray-900">AI活用事例・手順書</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              HTML ファイルをアップロードすると、このページで全員が閲覧できます
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!API_URL || uploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "アップロード中..." : "HTML をアップロード"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* 開発時の案内 */}
        {!API_URL && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>開発モード:</strong> <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_UPLOAD_API_URL</code> が未設定です。
            AWS デプロイ後に CloudFormation Outputs の <strong>UploadApiUrl</strong> を設定すると実際にアップロードできます。
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
            {error}
          </div>
        )}

        {/* ファイル一覧 */}
        {loading ? (
          <p className="text-center text-gray-400 py-16">読み込み中...</p>
        ) : files.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">まだファイルがありません</p>
            <p className="text-sm text-gray-300 mt-1">
              「HTML をアップロード」からAI活用の手順書や事例を追加しましょう
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((f) => (
              <a
                key={f.key}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-xl">
                    🌐
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                      {f.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(f.uploadedAt)} · {formatSize(f.size)}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
