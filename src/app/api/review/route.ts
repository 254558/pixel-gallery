import { NextRequest, NextResponse } from "next/server";
import { copy, del } from "@vercel/blob";
import path from "path";

export async function POST(req: NextRequest) {
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

  if (action === "approve") {
    // 复制到 public/ 前缀
    await copy(`pending/${safeName}`, `public/${safeName}`, {
      access: "public",
      addRandomSuffix: false,
    });
  }

  // 从 pending 删除
  await del(`pending/${safeName}`);

  return NextResponse.json({ success: true });
}

export const runtime = "nodejs";
