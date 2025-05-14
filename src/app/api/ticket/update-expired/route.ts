import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    // Ambil semua tiket yang aktif dan sudah lewat batas waktu
    const expiredTickets = await prisma.ticket.findMany({
      where: {
        statusLelang: {
          in: ["BERLANGSUNG", "BOOKED"],
        },
        batas_waktu: {
          not: null,
          lt: now,
        },
      },
      include: {
        bids: {
          orderBy: {
            amount: "desc", // cari bid tertinggi
          },
          take: 1, // ambil hanya 1 bid tertinggi
        },
      },
    });

    let updatedCount = 0;

    for (const ticket of expiredTickets) {
      const highestBid = ticket.bids[0]; // bisa undefined

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          statusLelang: "SELESAI",
          pemenangId: highestBid ? highestBid.userId : null,
        },
      });

      updatedCount++;
    }

    return NextResponse.json({
      message: "Update lelang selesai dijalankan.",
      updatedCount,
    });
  } catch (error) {
    console.error("❌ Gagal menjalankan update-expired:", error);
    return NextResponse.json(
      { error: "Gagal update status tiket" },
      { status: 500 }
    );
  }
}
