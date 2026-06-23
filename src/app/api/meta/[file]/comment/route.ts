import { NextRequest, NextResponse } from "next/server";
import { getMeta, setMeta } from "@/lib/kv";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const { author, text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const meta = await getMeta(file);
  const comment = {
    id: crypto.randomBytes(4).toString("hex"),
    author: author?.trim() || "匿名",
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  meta.comments.push(comment);
  await setMeta(file, meta);

  return NextResponse.json({ success: true, comment });
}
