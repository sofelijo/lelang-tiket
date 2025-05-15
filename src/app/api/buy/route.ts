// app/api/buy/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { ticketId } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ message: "ID tiket tidak valid" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { konser: true },
    });

    if (!ticket) {
      return NextResponse.json({ message: "Tiket tidak ditemukan" }, { status: 404 });
    }

    if (ticket.statusLelang !== "BERLANGSUNG") {
      return NextResponse.json({ message: "Tiket tidak tersedia untuk pembelian" }, { status: 400 });
    }

    if (!ticket.harga_beli) {
      return NextResponse.json({ message: "Tiket ini tidak bisa dibeli langsung" }, { status: 400 });
    }

    const userId = user.id; // ✨ Fix error: convert id to number

    // Update status tiket dan buat transaksi
    await prisma.$transaction([
      prisma.ticket.update({
        where: { id: ticketId },
        data: {
          statusLelang: "SELESAI",
          pemenangId: userId, // pakai userId yang sudah number
        },
      }),
      prisma.bid.create({
        data: {
          amount: ticket.harga_beli,
          ticketId: ticket.id,
          userId: userId, // pakai userId yang sudah number
        },
      }),
    ]);

    return NextResponse.json({ message: "Tiket berhasil dibeli" });
  } catch (error) {
    console.error("Error beli tiket:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
