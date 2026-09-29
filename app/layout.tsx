import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mia English · 小学英语 AI 老师",
  description: "面向小学生的分级英语学习、语音跟读、对话与测验应用。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
