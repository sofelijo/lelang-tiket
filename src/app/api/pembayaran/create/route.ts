// src/app/api/pembayaran/create/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateEstimasi, MetodePembayaran } from "@/lib/payment/calculateEstimasi";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, metodePembayaran } = await req.json();
    const buyerId = Number(session.user.id);
    const metode = (metodePembayaran || "bank_transfer").toLowerCase() as MetodePembayaran;

    const existing = await prisma.pembayaran.findFirst({
      where: {
        ticketId,
        buyerId,
        statusPembayaran: "PENDING",
        qrisExpiredAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json({ id: existing.id });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        konser: true,
        user: true,
        bids: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
    }

    // 🧮 Hitung estimasi TANPA kodeUnik
    const estimasi = calculateEstimasi(ticket, metode);

    // 🔢 Generate kode unik random
    const kodeUnik = Math.floor(100 + Math.random() * 900); // 100–999

    // 💰 Hitung ulang total dengan kodeUnik yang baru
    const jumlahTotal =
      estimasi.hargaTiket +
      estimasi.feePlatform +
      estimasi.feeMetode +
      estimasi.feeTransaksi +
      kodeUnik;

    const prefix = ticket.kelipatan === null ? "JL" : "LL";
    const order_id = `${prefix}-${ticket.konser.id}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const pembayaran = await prisma.pembayaran.create({
      data: {
        ticketId,
        buyerId,
        hargaTiket: estimasi.hargaTiket,
        feePlatform: estimasi.feePlatform,
        feeMetode: estimasi.feeMetode,
        feeMetodeFlat: estimasi.feeTransaksi,
        kodeUnik: kodeUnik, // ✅ kode unik acak disimpan
        jumlahTotal: jumlahTotal, // ✅ total sinkron dengan kode unik baru
        order_id,
        snapMethod: metode,
        statusPembayaran: "PENDING",
        qrisExpiredAt: null,
      },
    });

    return NextResponse.json({ id: pembayaran.id });
  } catch (err) {
    console.error("❌ Error di pembayaran/create:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
