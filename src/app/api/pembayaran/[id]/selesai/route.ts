import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    await prisma.pembayaran.update({
      where: { id },
      data: { sudahDipakai: true },
    });

    return NextResponse.json({ message: "Tiket ditandai sudah digunakan" });
  } catch (error) {
    console.error("❌ Gagal konfirmasi tiket:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
