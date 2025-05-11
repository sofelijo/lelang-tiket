import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const FEE_METODE: Record<string, { persen: number; tetap: number }> = {
  qris: { persen: 0.01, tetap: 2000 },
  credit_card: { persen: 0.05, tetap: 5000 },
  bank_transfer: { persen: 0, tetap: 10000 },
  cstore: { persen: 0, tetap: 10000 },
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, metodePembayaran } = await req.json();
    const buyerId = Number(session.user.id);
    const metode = (metodePembayaran || "bank_transfer").toLowerCase();

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

    // 🎯 Penentuan harga tiket
    const lastBid = ticket.bids.sort((a, b) => b.amount - a.amount)[0];
    let hargaTiket = 0;

    if (ticket.kelipatan === null) {
      // Jual langsung
      hargaTiket = ticket.harga_beli ?? 0;
    } else if (ticket.statusLelang === "SELESAI") {
      hargaTiket = lastBid?.amount ?? ticket.harga_awal ?? 0;
    } else {
      // Lelang belum selesai
      hargaTiket = lastBid?.amount ?? ticket.harga_beli ?? 0;
    }
    

    const kodeUnik = Math.floor(100 + Math.random() * 900);
    const feeConfig = FEE_METODE[metode] || { persen: 0, tetap: 10000 };
    const rawPlatform = Math.ceil(hargaTiket * 0.03);
    const feePlatform = Math.max(rawPlatform, 13000);
    const feeMetode = Math.ceil(hargaTiket * feeConfig.persen);
    const feeMetodeFlat = feeConfig.tetap;
    const jumlahTotal = hargaTiket + feePlatform + feeMetode + feeMetodeFlat + kodeUnik;

    const order_id = `lelang-${ticket.konser.id}-${Date.now()}`;

    const pembayaran = await prisma.pembayaran.create({
      data: {
        ticketId,
        buyerId,
        hargaTiket,
        feePlatform,
        feeMetode,
        feeMetodeFlat,
        kodeUnik,
        jumlahTotal,
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
