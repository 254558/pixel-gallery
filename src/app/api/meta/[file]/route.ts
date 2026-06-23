import { NextRequest, NextResponse } from "next/server";
import { getMeta } from "@/lib/kv";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const meta = await getMeta(file);
  return NextResponse.json(meta);
}
