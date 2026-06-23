import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 密码验证
  const password = req.headers.get("x-admin-password");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && password !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { file } = body;
  if (!file) {
    return NextResponse.json({ error: "Missing file name" }, { status: 400 });
  }

  if (process.env.VERCEL) {
    // Vercel：从 Blob 删除
    const { del } = await import("@vercel/blob");
    const path = await import("path");
    await del(`public/${path.basename(file)}`);
  } else {
    // 本地开发：删除本地文件
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public", path.basename(file));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return NextResponse.json({ success: true });
}

export const runtime = "nodejs";
