import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const tickets = await prisma.ticket.findMany({
      where: {
        batas_waktu: {
          gt: now, // hanya tiket yang belum habis waktunya
        },
      },
      include: {
        bids: {
          orderBy: { createdAt: "desc" }, // ambil bid terakhir duluan
        },
        konser: true,
        kategori: true,
      },
    });

    const sorted = tickets
      .filter((ticket) => ticket.batas_waktu !== null) // pastikan tidak null
      .map((ticket) => {
        const lastBid = ticket.bids[0];
        const hargaTerkini = lastBid?.amount ?? ticket.harga_awal ?? 0;

        const batas = ticket.batas_waktu
          ? new Date(ticket.batas_waktu).getTime()
          : 0;
        const sisaWaktuMs = batas - now.getTime();

        return {
          id: ticket.id,
          harga_awal: ticket.harga_awal,
          harga_terkini: hargaTerkini,
          seat: ticket.seat,
          tipeTempat: ticket.tipeTempat,
          jumlahBid: ticket.bids.length,
          batas_waktu: ticket.batas_waktu,
          jumlah:ticket.jumlah,
          sisaWaktuMs,
          konser: {
            id: ticket.konser.id,
            nama: ticket.konser.nama,
            lokasi: ticket.konser.lokasi,
            tanggal: ticket.konser.tanggal,
            image: ticket.konser.image,
          },
          kategori: {
            id: ticket.kategori.id,
            nama: ticket.kategori.nama,
          },
        };
      })
      .sort((a, b) => {
        if (b.jumlahBid !== a.jumlahBid) {
          return b.jumlahBid - a.jumlahBid; // urut bid terbanyak
        }
        const waktuA = a.batas_waktu
          ? new Date(a.batas_waktu).getTime()
          : 0;
        const waktuB = b.batas_waktu
          ? new Date(b.batas_waktu).getTime()
          : 0;
        return waktuA - waktuB; // urut waktu paling cepat habis
      });

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("[TOP_TICKET]", error);
    return NextResponse.json(
      { message: "Gagal mengambil tiket" },
      { status: 500 }
    );
  }
}
