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
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            createdAt: true,
            image : true,
            _count: {
              select: {
                tickets: {
                  where: {
                    statusLelang: "SELESAI",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ message: "Tiket tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
