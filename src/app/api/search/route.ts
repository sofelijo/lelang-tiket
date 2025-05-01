// 📁 src/app/api/search/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ konser: [] });
  }

  const konser = await prisma.konser.findMany({
    where: {
      nama: {
        contains: query,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      nama: true,
      tanggal: true,
      lokasi: true,
    },
  });

  return NextResponse.json({ konser });
}
