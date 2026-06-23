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
  const idx = meta.favoritedBy.indexOf(visitorId);
  if (idx === -1) {
    meta.favoritedBy.push(visitorId);
    meta.favorites = meta.favoritedBy.length;
  } else {
    meta.favoritedBy.splice(idx, 1);
    meta.favorites = meta.favoritedBy.length;
  }

  await setMeta(file, meta);
  return NextResponse.json({ favorites: meta.favorites, favorited: idx === -1 });
}
