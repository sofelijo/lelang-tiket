// File: /src/app/api/konser/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const konserId = parseInt(params.id);

  if (isNaN(konserId)) {
    return NextResponse.json({ error: "Invalid konser ID" }, { status: 400 });
  }

  try {
    const konser = await prisma.konser.findUnique({
      where: { id: konserId },
      include: {
        konserKategori: {
          include: {
            kategori: true,
          },
        },
      },
    });

    if (!konser) {
      return NextResponse.json({ error: "Konser not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: konser.id,
      nama: konser.nama,
      lokasi: konser.lokasi,
      tanggal: konser.tanggal,
      venue: konser.venue,
      image: konser.image,
      kategori: konser.konserKategori.map((kk) => kk.kategori.nama),
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

