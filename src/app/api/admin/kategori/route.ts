import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua kategori
export async function GET() {
  try {
    const kategori = await prisma.kategori.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json(kategori);
  } catch (error) {
    console.error("❌ Gagal ambil kategori:", error);
    return NextResponse.json({ message: "Gagal mengambil data kategori" }, { status: 500 });
  }
}

// POST: Tambah kategori baru
export async function POST(req: NextRequest) {
  try {
    const { nama } = await req.json();

    if (!nama || typeof nama !== "string") {
      return NextResponse.json({ message: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const kategori = await prisma.kategori.create({
      data: { nama },
    });

    return NextResponse.json({ success: true, kategori });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Kategori sudah ada (duplikat)" }, { status: 409 });
    }

    console.error("❌ Gagal tambah kategori:", error);
    return NextResponse.json({ message: "Gagal menambah kategori" }, { status: 500 });
  }
}
