import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdirSync, existsSync } from "fs";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File;
  const konserId = data.get("konserId")?.toString();

  if (!file || !konserId) {
    return NextResponse.json({ message: "Missing file or konserId" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `konserid${konserId}.jpg`;
  const uploadDir = path.join(process.cwd(), "public", "konser");

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);

  return NextResponse.json({ success: true, filename: `/konser/${filename}` });
}
