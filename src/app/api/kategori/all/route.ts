import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const kategori = await prisma.kategori.findMany({
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    });

    return NextResponse.json(kategori);
  } catch (error) {
    console.error("Gagal ambil kategori:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
