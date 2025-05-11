import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Konfigurasi fee
const FEE_PLATFORM_PERCENT = 0.03;
const FEE_PLATFORM_MIN = 13000;
const KODE_UNIK = 999;

const FEE_METODE: Record<string, { persen: number; tetap: number }> = {
  qris: { persen: 0.01, tetap: 2000 },
  credit_card: { persen: 0.05, tetap: 5000 },
  bank_transfer: { persen: 0, tetap: 10000 },
  cstore: { persen: 0, tetap: 10000 },
};

export async function GET(req: NextRequest) {
  const ticketId = req.nextUrl.searchParams.get("ticketId");
  const metode = req.nextUrl.searchParams.get("metode") || "bank_transfer";
  const mode = req.nextUrl.searchParams.get("mode") || "detail";
  const hargaDasarParam = req.nextUrl.searchParams.get("harga_dasar");
  const overrideHargaDasar = hargaDasarParam ? Number(hargaDasarParam) : null;

  if (mode === "detail" && !ticketId) {
    return NextResponse.json({ message: "ticketId wajib diisi" }, { status: 400 });
  }

  const tickets =
    mode === "detail"
      ? await prisma.ticket.findUnique({
          where: { id: Number(ticketId) },
          include: { bids: true },
        })
      : await prisma.ticket.findMany({ include: { bids: true } });

  if (!tickets || (Array.isArray(tickets) && tickets.length === 0)) {
    return NextResponse.json({ message: "Ticket tidak ditemukan" }, { status: 404 });
  }

  const calculate = (ticket: any, metodeKey = metode) => {
    const lastBid = ticket.bids.sort((a: any, b: any) => b.amount - a.amount)[0];

    let hargaTiket = 0;

    // Jika override via query ada, pakai itu
    if (overrideHargaDasar !== null && !isNaN(overrideHargaDasar)) {
      hargaTiket = overrideHargaDasar;
    } else if (ticket.kelipatan === null) {
      hargaTiket = ticket.harga_beli;
    } else if (ticket.statusLelang === "SELESAI") {
      hargaTiket = lastBid?.amount ?? ticket.harga_awal;
    } else {
      hargaTiket = ticket.harga_beli;
    }

    const feeConfig = FEE_METODE[metodeKey] || { persen: 0, tetap: 10000 };
    const feePlatform = Math.max(
      Math.ceil(hargaTiket * FEE_PLATFORM_PERCENT),
      FEE_PLATFORM_MIN
    );
    const feeMetode = Math.ceil(hargaTiket * feeConfig.persen);
    const feeTransaksi = feeConfig.tetap;
    const totalBayar = hargaTiket + feePlatform + feeMetode + feeTransaksi + KODE_UNIK;
    const hargaPerTiket = Math.floor(totalBayar / (ticket.jumlah || 1));


    return {
      ticketId: ticket.id,
      metode: metodeKey,
      hargaTiket,
      jumlah: ticket.jumlah,
      feePlatform,
      feeMetode,
      feeTransaksi,
      kodeUnik: KODE_UNIK,
      totalBayar,
      hargaPerTiket,
    };
  };

  if (mode === "detail") {
    const result = calculate(tickets);
    return NextResponse.json(result);
  }

  if (mode === "termurah-all") {
    if (!ticketId) {
      return NextResponse.json({ message: "ticketId wajib diisi" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: Number(ticketId) },
      include: { bids: true },
    });

    if (!ticket) {
      return NextResponse.json({ message: "Ticket tidak ditemukan" }, { status: 404 });
    }

    const metodeList = Object.keys(FEE_METODE);
    const result = metodeList.map((metodeKey) => calculate(ticket, metodeKey));

    const minTotal = Math.min(...result.map((r) => r.totalBayar));
    const termurahList = result.filter((r) => r.totalBayar === minTotal);

    console.log("🎯 TERMURAH LIST:", termurahList);

    return NextResponse.json(termurahList);
  }

  if (mode === "satuan-termurah") {
    const result = (tickets as any[])
      .map((t) => calculate(t))
      .sort((a, b) => a.hargaPerTiket - b.hargaPerTiket)[0];
    return NextResponse.json(result);
  }

  return NextResponse.json({ message: "Mode tidak dikenali" }, { status: 400 });
}
