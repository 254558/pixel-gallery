import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "pending/" });
    // 过滤掉 pending-meta.json 这样的元数据文件
    const pending = blobs
      .filter((b) => b.pathname !== "pending-meta.json" && b.pathname !== "pending/")
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
