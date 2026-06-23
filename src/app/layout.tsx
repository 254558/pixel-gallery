import type { Metadata } from "next";
import "./globals.css";
import "@/components/dotmatrix-loader.css";

export const metadata: Metadata = {
  title: "发呆像素",
  description: "神游时收集的像素碎片",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
