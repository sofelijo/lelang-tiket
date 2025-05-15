import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  // Validasi basic (jika kosong atau bukan UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!id || !uuidRegex.test(id)) {
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
