// /app/api/pembayaran/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  const pembayaran = await prisma.pembayaran.findUnique({
    where: { id },
    include: {
      ticket: {
        include: {
          konser: true,
          kategori: true, // ✅ penting!
          user: {
            select: {
              id: true,
              name: true,
              phoneNumber: true, // nomor WA penjual
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true, // nomor WA pembeli
        },
      },
    },
  });

  if (!pembayaran) {
    return NextResponse.json({ error: "Data pembayaran tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(pembayaran);
}
