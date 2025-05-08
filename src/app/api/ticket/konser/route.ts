import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const konserId = searchParams.get("konserId");
  const metode = searchParams.get("metode");

  if (!konserId || isNaN(Number(konserId))) {
    return NextResponse.json({ error: "Invalid or missing konserId" }, { status: 400 });
  }

  try {
    const whereFilter: any = {
      konserId: Number(konserId),
    };

    if (metode === "LELANG") {
      whereFilter.kelipatan = { not: null };
    } else if (metode === "JUAL_LANGSUNG") {
      whereFilter.kelipatan = null;
    }

    const tiket = await prisma.ticket.findMany({
      where: whereFilter,
      include: {
        kategori: true,
        bids: {
          orderBy: { createdAt: "desc" },
          take: 1, // ambil bid terakhir
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = tiket.map((t) => ({
      id: t.id,
      metode: t.kelipatan ? "LELANG" : "JUAL_LANGSUNG",
      kategori: t.kategori.nama,
      harga_awal: t.harga_awal,
      harga_bid: t.bids[0]?.amount ?? null, // ambil dari bids
      harga_beli: t.harga_beli,
      jumlah: t.jumlah,
      sebelahan: t.sebelahan,
      batas_waktu: t.batas_waktu,
      statusLelang: t.statusLelang,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[ERROR_TIKET_GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
