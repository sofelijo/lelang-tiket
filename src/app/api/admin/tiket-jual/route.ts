// File: src/app/api/admin/tiket-jual/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tiketJual = await prisma.ticket.findMany({
      where: {
        kelipatan: null, // Tiket jual langsung
      },
      include: {
        konser: true,
        kategori: true,
        user: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(tiketJual);
  } catch (error) {
    console.error("Gagal ambil data tiket jual:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
