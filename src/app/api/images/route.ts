import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif"];

export async function GET() {
  const dir = path.join(process.cwd(), "public");
  try {
    const files = fs.readdirSync(dir);
    const images = files.filter((file) =>
      IMAGE_EXTENSIONS.some((ext) => file.toLowerCase().endsWith(ext))
    );
    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
