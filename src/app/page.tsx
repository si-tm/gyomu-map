import Link from "next/link";
import BusinessMap from "@/components/BusinessMap";
import businessMapData from "@/data/businessMap.json";
import { BusinessMapData } from "@/types";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">業務マップ</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              各セルをクリックして AI 活用のアイデアを確認・投稿できます
            </p>
          </div>
          <Link
            href="/resources"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            📎 AI活用事例・手順書
          </Link>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <BusinessMap data={businessMapData as BusinessMapData} />
      </div>

      <footer className="text-center text-xs text-gray-400 py-6">
        業務マップ AI活用共有サイト — データは{" "}
        <code className="bg-gray-100 px-1 rounded">src/data/businessMap.json</code>{" "}
        で管理されています
      </footer>
    </main>
  );
}
