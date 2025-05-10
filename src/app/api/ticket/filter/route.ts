// /app/api/ticket/filter/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const konserId = searchParams.get("konserId");
    const metode = searchParams.get("metode");
    const kategori = searchParams.get("kategori");
    const sebelahan = searchParams.get("sebelahan");
    const jumlah = searchParams.get("jumlah");
    const sort = searchParams.get("sort");

    if (!konserId || isNaN(Number(konserId))) {
      return NextResponse.json({ error: "konserId wajib dan harus angka" }, { status: 400 });
    }

    const konserIdInt = Number(konserId);

    const tickets = await prisma.ticket.findMany({
      where: {
        konserId: konserIdInt,
        kelipatan:
          metode === "LELANG" ? { not: null } : metode === "JUAL_LANGSUNG" ? null : undefined,
        kategori: kategori ? { nama: kategori } : undefined,
        sebelahan: sebelahan === null ? undefined : sebelahan === "true",
        jumlah: jumlah ? Number(jumlah) : undefined,
      },
      include: {
        bids: true,
        Comment: true,
        pembayaran: {
          where: { statusPembayaran: "BERHASIL" },
        },
        kategori: true,
        user: true,
      },
    });

    const result = tickets
      .filter((t) => t.jumlah > 0)
      .map((ticket) => {
        const latestBid = ticket.bids.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )[0];
        const hargaBid = latestBid?.amount ?? ticket.harga_awal ?? 0;
        const hargaTotal = ticket.kelipatan ? hargaBid : ticket.harga_beli ?? 0;
        const hargaSatuan = hargaTotal / ticket.jumlah;

        const komentarValid = ticket.Comment.filter((c) => c.userId !== ticket.userId);

        let poinKomentar = 0;
        for (const komen of komentarValid) {
          const isBuyer = ticket.pembayaran.some(
            (p) => p.buyerId === komen.userId && p.statusPembayaran === "BERHASIL"
          );
          poinKomentar += isBuyer ? 1 : 0.2;
        }

        const skorPopuler = Math.round(ticket.bids.length + poinKomentar);

        console.log(
          `[SKOR] 🎫 Ticket ID ${ticket.id} | Bid: ${ticket.bids.length}, Komentar: ${komentarValid.length}, PoinKomentar: ${poinKomentar}, SkorPopuler: ${skorPopuler}`
        );

        return {
          ...ticket,
          hargaTotal,
          hargaSatuan,
          skorPopuler,
          waktuSisa:
            ticket.kelipatan && ticket.batas_waktu
              ? new Date(ticket.batas_waktu).getTime() - Date.now()
              : null,
        };
      });

    let sorted = result;
    switch (sort) {
      case "termurah_total":
        sorted = result.sort((a, b) => a.hargaTotal - b.hargaTotal);
        break;
      case "termurah_satuan":
        sorted = result.sort((a, b) => a.hargaSatuan - b.hargaSatuan);
        break;
      case "termahal_total":
        sorted = result.sort((a, b) => b.hargaTotal - a.hargaTotal);
        break;
      case "termahal_satuan":
        sorted = result.sort((a, b) => b.hargaSatuan - a.hargaSatuan);
        break;
      case "terbaru":
        sorted = result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "terpopuler":
        sorted = result.sort((a, b) => {
          if (b.skorPopuler !== a.skorPopuler) {
            return b.skorPopuler - a.skorPopuler;
          }
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
        break;
      case "mauhabis":
        sorted = result
          .filter((t) => t.batas_waktu !== null)
          .sort((a, b) => new Date(a.batas_waktu!).getTime() - new Date(b.batas_waktu!).getTime());
        break;
    }

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("[ERROR_TIKET_FILTER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
