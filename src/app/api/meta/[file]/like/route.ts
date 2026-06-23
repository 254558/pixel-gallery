import { NextRequest, NextResponse } from "next/server";
import { getMeta, setMeta } from "@/lib/kv";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const { visitorId } = await req.json();
  if (!visitorId) {
    return NextResponse.json({ error: "visitorId required" }, { status: 400 });
  }

  const meta = await getMeta(file);
  const idx = meta.likedBy.indexOf(visitorId);
  if (idx === -1) {
    meta.likedBy.push(visitorId);
    meta.likes = meta.likedBy.length;
  } else {
    meta.likedBy.splice(idx, 1);
    meta.likes = meta.likedBy.length;
  }

  await setMeta(file, meta);
  return NextResponse.json({ likes: meta.likes, liked: idx === -1 });
}
