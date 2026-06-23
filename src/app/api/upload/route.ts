import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = file.name.toLowerCase().match(/\.\w+$/)?.[0] || "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json({ error: `File type not allowed` }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.VERCEL) {
    // Vercel: 上传到 Blob
    const { put } = await import("@vercel/blob");
    const result = await put(`pending/${uniqueName}`, buffer, {
      access: "public",
      addRandomSuffix: false,
    });
    return NextResponse.json({ success: true, file: uniqueName, url: result.url });
  } else {
    // 本地开发：存到本地目录
    const uploadsDir = path.join(process.cwd(), "public");
    fs.writeFileSync(path.join(uploadsDir, uniqueName), buffer);
    return NextResponse.json({ success: true, file: uniqueName });
  }
}

export const runtime = "nodejs";
