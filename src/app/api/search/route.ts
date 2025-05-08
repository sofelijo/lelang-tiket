// ✅ src/app/api/search/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  try {
    const konserList = await prisma.konser.findMany({
      where: {
        nama: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        tiket: true, // ✅ include relasi tiket
      },
    });

    return NextResponse.json(konserList);
  } catch (error) {
    console.error("Gagal ambil data konser:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
