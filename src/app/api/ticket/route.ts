import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; // sesuaikan path sesuai struktur

// GET: Ambil semua data tiket
export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        konser: true,
        kategori: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Gagal mengambil tiket:', error)
    return NextResponse.json({ error: 'Gagal ambil data' }, { status: 500 })
  }
}

 
// POST: Tambah tiket baru
export async function POST(req: Request) {
  const body = await req.json();
  const { namaKonser, namaKategori, seat, tipeTempat, harga_awal, batas_waktu } = body;

  try {
    // Cari konser berdasarkan nama
    const konser = await prisma.konser.findFirst({
      where: { nama: namaKonser },
    });

    if (!konser) {
      return NextResponse.json({ message: 'Konser tidak ditemukan' }, { status: 404 });
    }

    // Cari kategori berdasarkan nama
    const kategori = await prisma.kategori.findFirst({
      where: { nama: namaKategori },
    });

    if (!kategori) {
      return NextResponse.json({ message: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    // Buat tiket baru
    const newTicket = await prisma.ticket.create({
      data: {
        seat,
        tipeTempat,
        harga_awal: Number(harga_awal),
        batas_waktu: new Date(batas_waktu),
        konserId: konser.id,
        kategoriId: kategori.id,
      },
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Error saat membuat tiket:', error);
    return NextResponse.json({ message: 'Gagal tambah tiket', error }, { status: 500 });
  }
}
