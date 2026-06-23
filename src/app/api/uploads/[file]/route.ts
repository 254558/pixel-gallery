import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const safeName = path.basename(file);

  if (!process.env.VERCEL) {
    return NextResponse.json({ error: "Not available in dev mode" }, { status: 404 });
  }

  try {
    const { get } = await import("@vercel/blob");
    const result = await get(`pending/${safeName}`, { access: "public" });

    if (!result) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const ext = path.extname(safeName).toLowerCase();
    const mime: Record<string, string> = {
      ".png": "image/png",
      ".webp": "image/webp",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
    };

    // result.stream 是 ReadableStream
    if (result.stream) {
      return new NextResponse(result.stream as ReadableStream, {
        headers: {
          "Content-Type": mime[ext] || "application/octet-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    // fallback: 用 url 直接 fetch
    if (result.blob?.url) {
      const resp = await fetch(result.blob.url);
      return new NextResponse(resp.body, {
        headers: {
          "Content-Type": mime[ext] || "application/octet-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

    return NextResponse.json({ error: "File not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

export const runtime = "nodejs";
