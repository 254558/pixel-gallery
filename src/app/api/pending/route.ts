import { NextResponse } from "next/server";

export async function GET() {
  // 非 Vercel 环境：没有待审核（本地直接上传到 public/，无需审核）
  if (!process.env.VERCEL) {
    return NextResponse.json({ pending: [] });
  }

  // Vercel：从 Blob 列出 pending/ 前缀的文件
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: "pending/" });
    const pending = blobs
      .filter((b) => b.pathname !== "pending/")
      .map((b) => ({
        file: b.pathname.replace("pending/", ""),
        uploadedAt: b.uploadedAt.toISOString(),
      }));
    return NextResponse.json({ pending });
  } catch {
    return NextResponse.json({ pending: [] });
  }
}

export const runtime = "nodejs";
