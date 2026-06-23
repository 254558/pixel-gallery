import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const DATA_DIR = path.join(process.cwd(), "data");
const PENDING_FILE = path.join(DATA_DIR, "pending.json");

function readPending(): { file: string; uploadedAt: string }[] {
  try {
    return JSON.parse(fs.readFileSync(PENDING_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writePending(list: { file: string; uploadedAt: string }[]) {
  fs.writeFileSync(PENDING_FILE, JSON.stringify(list, null, 2));
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // 校验文件类型
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: `File type ${ext} not allowed` },
      { status: 400 }
    );
  }

  // 校验文件大小
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large (max 10MB)" },
      { status: 400 }
    );
  }

  // 生成唯一文件名，防止冲突
  const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(UPLOADS_DIR, uniqueName);

  // 确保 uploads 目录存在
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.writeFileSync(filePath, buffer);

  // 记录到待审核列表
  const pending = readPending();
  pending.push({ file: uniqueName, uploadedAt: new Date().toISOString() });
  writePending(pending);

  return NextResponse.json({ success: true, file: uniqueName });
}

// 限制 body 大小（Next.js 默认）
export const config = {
  api: {
    bodyParser: false,
  },
};
