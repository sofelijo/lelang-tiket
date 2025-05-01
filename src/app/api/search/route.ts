// /app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      lokasi: true,
      tanggal: true,
    },
  });

  return NextResponse.json({ konser });
}
