import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "换装研究所｜实时手势换装",
  description:
    "选择喜欢的卡通角色，用鼠标或摄像头手势浏览十套服装，捏合即可完成实时换装。",
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
      <body>{children}</body>
    </html>
  );
}
