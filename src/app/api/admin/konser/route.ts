// app/api/admin/konser/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { nama, tanggal, lokasi, venue, kategoriIds } = await req.json();

    const konser = await prisma.konser.create({
      data: {
        nama,
        tanggal: new Date(tanggal),
        lokasi,
        venue,
        konserKategori: {
          create: kategoriIds.map((kategoriId: number) => ({
            kategori: { connect: { id: kategoriId } },
          })),
        },
      },
    });

    return NextResponse.json({ success: true, konser });
  } catch (error) {
    console.error("Gagal menambah konser:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
