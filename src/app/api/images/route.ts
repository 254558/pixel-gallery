import { NextResponse } from "next/server";
import crypto from "crypto";
import { list } from "@vercel/blob";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET() {
  // 非 Vercel 环境直接走本地文件
  if (!process.env.VERCEL) {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const dir = path.join(process.cwd(), "public");
      const files = fs.readdirSync(dir);
      const images = shuffle(
        files
          .filter((file) =>
            IMAGE_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext))
          )
          .map((name) => ({
            name,
            url: `/${name}`,
          }))
      ).map((item, i) => ({ ...item, index: i + 1 }));
      return NextResponse.json({ images });
    } catch {
      return NextResponse.json({ images: [] });
    }
  }

  // Vercel 环境：从 Blob 读取
  try {
    const { blobs } = await list({ prefix: "public/" });
    const images = shuffle(
      blobs
        .filter((b) =>
          IMAGE_EXTENSIONS.some((ext) => b.pathname.toLowerCase().endsWith(ext))
        )
        .map((b) => ({
          name: b.pathname.replace("public/", ""),
          url: b.url,
        }))
    ).map((item, i) => ({ ...item, index: i + 1 }));
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}

export const runtime = "nodejs";
