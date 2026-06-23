import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// 简单最近邻放大 PNG/WebP（GIF 原样返回）
export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file");
  const scale = Math.min(Number(req.nextUrl.searchParams.get("scale")) || 3, 6);

  if (!file) {
    return new NextResponse("Missing file param", { status: 400 });
  }

  const safeName = path.basename(file);
  const filePath = path.join(process.cwd(), "public", safeName);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  // GIF 直接返回原图，放大靠 CSS pixelated
  if (safeName.toLowerCase().endsWith(".gif")) {
    const buffer = fs.readFileSync(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  try {
    const metadata = await sharp(filePath).metadata();
    const w = metadata.width || 1;
    const h = metadata.height || 1;

    const buffer = await sharp(filePath)
      .resize(Math.round(w * scale), Math.round(h * scale), {
        kernel: "nearest",
      })
      .toBuffer();

    const ext = path.extname(safeName).toLowerCase();
    const mime: Record<string, string> = {
      ".png": "image/png",
      ".webp": "image/webp",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
    };

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mime[ext] || "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return new NextResponse("Enlarge failed", { status: 500 });
  }
}
