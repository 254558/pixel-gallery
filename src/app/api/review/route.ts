import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const PENDING_FILE = path.join(process.cwd(), "data", "pending.json");

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
  // 简单密码校验
  const password = req.headers.get("x-admin-password");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { file, action } = body;

  if (!file || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const safeName = path.basename(file);
  const srcPath = path.join(UPLOADS_DIR, safeName);

  if (!fs.existsSync(srcPath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (action === "approve") {
    // 移动到 public/
    const destPath = path.join(PUBLIC_DIR, safeName);
    fs.renameSync(srcPath, destPath);
  } else {
    // 拒绝，直接删除
    fs.unlinkSync(srcPath);
  }

  // 从 pending.json 移除
  const pending = readPending();
  const filtered = pending.filter((item) => item.file !== safeName);
  writePending(filtered);

  return NextResponse.json({ success: true });
}
