import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

export async function GET() {
  try {
    const { blobs } = await list({ prefix: "public/" });
    const images = blobs
      .filter((b) =>
        IMAGE_EXTENSIONS.some((ext) => b.pathname.toLowerCase().endsWith(ext))
      )
      .map((b) => ({
        name: b.pathname.replace("public/", ""),
        url: b.url, // Blob 公开 URL
      }));
    return NextResponse.json({ images });
  } catch {
    // 降级：读取本地 public/ 目录（开发环境或未配置 Blob 时）
    try {
      const fs = await import("fs");
      const path = await import("path");
      const dir = path.join(process.cwd(), "public");
      const files = fs.readdirSync(dir);
      const images = files
        .filter((file) =>
          IMAGE_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext))
        )
        .map((name) => ({
          name,
          url: `/${name}`,
        }));
      return NextResponse.json({ images });
    } catch {
      return NextResponse.json({ images: [] });
    }
  }
}

export const runtime = "nodejs";
