import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // sesuaikan path sesuai struktur
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Ambil semua data tiket
export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        konser: true,
        kategori: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Gagal mengambil tiket:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

// POST: Tambah tiket baru
// POST: Tambah tiket baru
// export async function POST(req: Request) {
//   const body = await req.json();
//   const {
//     konserId,
//     kategoriId,
//     seat,
//     tipeTempat,
//     harga_awal,
//     batas_waktu,
//     harga_beli,
//     kelipatan,
//     perpanjangan_bid,
//     deskripsi,
//   } = body;

//   try {
//     const konser = await prisma.konser.findFirst({ where: { id: konserId  } });
//     if (!konser) {
//       return NextResponse.json({ message: 'Konser tidak ditemukan' }, { status: 404 });
//     }

//     const kategori = await prisma.kategori.findFirst({ where: { id: kategoriId } });
//     if (!kategori) {
//       return NextResponse.json({ message: 'Kategori tidak ditemukan' }, { status: 404 });
//     }

//     const newTicket = await prisma.ticket.create({
//       data: {
//         seat,
//         tipeTempat,
//         harga_awal: Number(harga_awal),
//         batas_waktu: new Date(batas_waktu),
//         harga_beli: harga_beli ? Number(harga_beli) : null,
//         kelipatan: kelipatan ? Number(kelipatan) : null,
//         perpanjangan_bid: perpanjangan_bid ?? null,
//         konserId: konser.id,
//         kategoriId: kategori.id,
//         deskripsi,
//       },
//     });

//     return NextResponse.json(newTicket, { status: 201 });
//   } catch (error) {
//     console.error('Error saat membuat tiket:', error);
//     return NextResponse.json({ message: 'Gagal tambah tiket', error }, { status: 500 });
//   }
// }

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    konserId,
    kategoriId,
    seat,
    tipeTempat,
    harga_awal,
    batas_waktu,
    harga_beli,
    kelipatan,
    perpanjangan_bid,
    deskripsi,
    jumlah,
    statusLelang,
  } = body;

  try {
    const konser = await prisma.konser.findFirst({ where: { id: konserId } });
    if (!konser) {
      return NextResponse.json(
        { message: "Konser tidak ditemukan" },
        { status: 404 }
      );
    }

    const kategori = await prisma.kategori.findFirst({
      where: { id: kategoriId },
    });
    if (!kategori) {
      return NextResponse.json(
        { message: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    const newTicket = await prisma.ticket.create({
      data: {
        seat,
        tipeTempat,
        harga_awal: Number(harga_awal),
        batas_waktu: new Date(batas_waktu),
        harga_beli: harga_beli ? Number(harga_beli) : null,
        kelipatan: kelipatan ? Number(kelipatan) : null,
        perpanjangan_bid: perpanjangan_bid ?? null,
        konserId: konser.id,
        kategoriId: kategori.id,
        deskripsi,
        userId: Number(session.user.id), // ✅ Tambahkan ini
        jumlah: parseInt(jumlah),
        statusLelang: "BERLANGSUNG"
,
      },
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error("Error saat membuat tiket:", error);
    return NextResponse.json(
      { message: "Gagal tambah tiket", error },
      { status: 500 }
    );
  }
}
