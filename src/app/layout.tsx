import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "業務マップ | AI活用共有",
  description: "部内業務におけるAI活用アイデアの共有サイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
