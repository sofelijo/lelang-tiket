// src/app/api/ticket/auto-finish/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH() {
  try {
    const now = new Date();
    console.log("📌 Menjalankan auto-finish pada:", now.toISOString());

    const expiredTickets = await prisma.ticket.findMany({
      where: {
        statusLelang: { in: ["BERLANGSUNG", "PENDING", "BOOKED"] },
        batas_waktu: { lt: now },
        kelipatan: { not: null },
      },
      include: {
        bids: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    console.log("🎯 Jumlah tiket expired ditemukan:", expiredTickets.length);

    let count = 0;

    for (const ticket of expiredTickets) {
      const lastBid = ticket.bids[0];
      console.log(`🔄 Updating ticket ID ${ticket.id} | Last bid user: ${lastBid?.userId ?? "(no bid)"}`);

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          statusLelang: "SELESAI",
          pemenangId: lastBid?.userId ?? null,
        },
      });
      count++;
    }

    console.log("✅ Auto-finish selesai. Total tiket diupdate:", count);

    return NextResponse.json({
      message: "Auto finish success",
      totalUpdated: count,
    });
  } catch (error) {
    console.error("❌ Error auto-finish:", error);
    return NextResponse.json({ error: "Gagal auto-finish" }, { status: 500 });
  }
}

export async function GET() {
  console.log("🌐 GET /api/ticket/auto-finish dipanggil, redirecting ke PATCH");
  return PATCH();
}