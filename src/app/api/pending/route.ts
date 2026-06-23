import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PENDING_FILE = path.join(process.cwd(), "data", "pending.json");

export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(PENDING_FILE, "utf-8"));
    return NextResponse.json({ pending: data });
  } catch {
    return NextResponse.json({ pending: [] });
  }
}
