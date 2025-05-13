// app/api/admin/konser/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

// GET Konser by ID
export async function GET(_: NextRequest, { params }: Params) {
  const konser = await prisma.konser.findUnique({
    where: { id: parseInt(params.id) },
    include: { konserKategori: true },
  });

  if (!konser) {
    return NextResponse.json({ message: "Konser tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(konser);
}

// PUT Update Konser
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const id = parseInt(params.id);
    const { nama, lokasi, tanggal, venue, kategoriIds, image } = await req.json();

    const konser = await prisma.konser.update({
      where: { id },
      data: {
        nama,
        lokasi,
        tanggal: new Date(tanggal),
        venue: venue || null,
        image: image || undefined, // ✅ hanya update kalau dikirim
        konserKategori: {
          deleteMany: {},
        },
      },
    });

    if (Array.isArray(kategoriIds)) {
      await prisma.konserKategori.createMany({
        data: kategoriIds.map((kategoriId: number) => ({
          konserId: id,
          kategoriId,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ success: true, konser });
  } catch (error) {
    console.error("❌ Gagal update konser:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


