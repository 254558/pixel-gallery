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
  let images: { name: string; url: string }[] = [];

  if (!process.env.VERCEL) {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const dir = path.join(process.cwd(), "public");
      const files = fs.readdirSync(dir);
      images = files
        .filter((file) =>
          IMAGE_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext))
        )
        .map((name) => ({
          name,
          url: `/${name}`,
        }));
    } catch {
      // fall through
    }
  } else {
    try {
      const { blobs } = await list({ prefix: "public/" });
      images = blobs
        .filter((b) =>
          IMAGE_EXTENSIONS.some((ext) => b.pathname.toLowerCase().endsWith(ext))
        )
        .map((b) => ({
          name: b.pathname.replace("public/", ""),
          url: b.url,
        }));
    } catch {
      // fall through
    }
  }

  // 按文件名排序，保证前后端编号一致
  images.sort((a, b) => a.name.localeCompare(b.name));
  const withIndex = images.map((item, i) => ({ ...item, index: i + 1 }));

  // 打乱顺序用于瀑布流展示，但 index 保持不变
  const shuffled = shuffle(withIndex);

  return NextResponse.json({ images: shuffled });
}

export const runtime = "nodejs";
