import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 非 Vercel 环境：本地无需审核
  if (!process.env.VERCEL) {
    return NextResponse.json({ success: true });
  }

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

  const { copy, del } = await import("@vercel/blob");
  const path = await import("path");
  const safeName = path.basename(file);

  if (action === "approve") {
    await copy(`pending/${safeName}`, `public/${safeName}`, {
      access: "public",
      addRandomSuffix: false,
    });
  }

  await del(`pending/${safeName}`);

  return NextResponse.json({ success: true });
}

export const runtime = "nodejs";
