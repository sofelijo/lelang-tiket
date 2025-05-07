import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const konser = await prisma.konser.findMany({
      include: {
        tiket: true,
      },
    });

    const sorted = konser
      .map((k) => ({
        id: k.id,
        nama: k.nama,
        tanggal: k.tanggal,
        lokasi: k.lokasi,
        venue : k.venue,
        jumlahTiket: k.tiket.length,
        tipeTempat: k.tiket[0]?.tipeTempat ?? "berdiri",
      }))
      .sort((a, b) => b.jumlahTiket - a.jumlahTiket)
      .slice(0, 6);

    return NextResponse.json(sorted);
  } catch (error) {
    console.error("[TOP_KONSER]", error);
    return NextResponse.json({ message: "Gagal mengambil konser" }, { status: 500 });
  }
}
