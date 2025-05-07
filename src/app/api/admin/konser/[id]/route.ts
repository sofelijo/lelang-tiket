import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const konser = await prisma.konser.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!konser) {
      return NextResponse.json({ message: "Konser tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(konser);
  } catch (error) {
    console.error("Gagal mengambil detail konser:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
