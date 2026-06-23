import { NextRequest, NextResponse } from "next/server";
import { getMeta, setMeta } from "@/lib/kv";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ file: string; id: string }> }
) {
  const { file, id } = await params;

  const pw = req.headers.get("x-admin-password");
  if (pw !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const meta = await getMeta(file);
  meta.comments = meta.comments.filter((c) => c.id !== id);
  await setMeta(file, meta);

  return NextResponse.json({ success: true });
}
