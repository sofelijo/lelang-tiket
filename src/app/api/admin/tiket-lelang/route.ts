//src/app/api/admin/tiket-lelang/route.ts//

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tiket = await prisma.ticket.findMany({
      where: { kelipatan: { not: null } },
      include: {
        konser: true,
        kategori: true,
        user: true,
        pemenang: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tiket);
  } catch (error) {
    console.error("❌ Gagal ambil data tiket lelang:", error);
    return NextResponse.json({ message: "Gagal ambil data" }, { status: 500 });
  }
}
