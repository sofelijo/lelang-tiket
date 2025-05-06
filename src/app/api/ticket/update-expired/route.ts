// /app/api/ticket/update-expired/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    // 🔎 Update semua tiket yang aktif dan sudah melewati batas waktu
    const updated = await prisma.ticket.updateMany({
      where: {
        statusLelang: {
          in: ["BERLANGSUNG", "BOOKED"], // hanya status yang bisa kedaluwarsa
        },
        batas_waktu: {
          not: null,
          lt: now, // sudah lewat
        },
      },
      data: {
        statusLelang: "SELESAI",
      },
    });

    // 🔁 Balikan respon singkat saja
    return NextResponse.json({
      message: "Update lelang selesai dijalankan.",
      updatedCount: updated.count,
    });
  } catch (error) {
    console.error("❌ Gagal menjalankan update-expired:", error);
    return NextResponse.json(
      { error: "Gagal update status tiket" },
      { status: 500 }
    );
  }
}
