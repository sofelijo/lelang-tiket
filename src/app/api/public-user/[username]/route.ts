import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  const { username } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        name: true,
        image: true,
        bio: true,
        tickets: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            harga_awal: true,
            harga_beli: true,
            statusLelang: true,
            jumlah: true,
            seat: true,
            tipeTempat: true,
            sebelahan: true,
            createdAt: true,
            konser: {
              select: {
                nama: true,
                image: true,
                tanggal: true,
                lokasi: true,
              },
            },
            kategori: {
              select: { nama: true },
            },
            pembayaran: {
              select: {
                statusPembayaran: true,
                sudahDipakai: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Filter hanya tiket SELESAI dan ada pembayaran BERHASIL
    const tiketSelesai = user.tickets.filter((t) =>
    t.statusLelang === "SELESAI" &&
    t.pembayaran.some((p) =>
      p.statusPembayaran === "BERHASIL" && p.sudahDipakai === true
    )
    
    );

    // Hitung total jumlah tiket yang benar-benar terjual
    const totalJumlahTiketSelesai = tiketSelesai.reduce(
      (acc, curr) => acc + curr.jumlah,
      0
    );

    return NextResponse.json({
      username: user.username,
      name: user.name,
      image: user.image,
      bio: user.bio,
      totalTiketTerjual: totalJumlahTiketSelesai,
      jumlahListingTerjual: tiketSelesai.length,
      riwayatTiket: user.tickets.map((t) => ({
        id: t.id,
        harga_awal: t.harga_awal,
        harga_beli: t.harga_beli,
        statusLelang: t.statusLelang,
        jumlah: t.jumlah,
        seat: t.seat,
        tipeTempat: t.tipeTempat,
        sebelahan: t.sebelahan,
        createdAt: t.createdAt,
        konser: t.konser,
        kategori: t.kategori,
      })),
    });
  } catch (error) {
    console.error("Gagal fetch user:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan di server" },
      { status: 500 }
    );
  }
}
