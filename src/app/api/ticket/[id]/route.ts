// src/app/api/ticket/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        konser: true,
        kategori: true,
        bids: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: true, // 🛠️ Agar bid.user.name tersedia
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ message: "Tiket tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
