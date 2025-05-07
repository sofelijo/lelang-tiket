// app/api/admin/konser/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { nama, tanggal, lokasi, venue } = await req.json();

    if (!nama || !tanggal || !lokasi) {
      return NextResponse.json(
        { success: false, message: "Field wajib tidak boleh kosong." },
        { status: 400 }
      );
    }

    const konser = await prisma.konser.create({
      data: {
        nama,
        tanggal: new Date(tanggal),
        lokasi,
        venue: venue || null,
      },
    });

    return NextResponse.json({ success: true, konser });
  } catch (error) {
    console.error("❌ Gagal menambah konser:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
