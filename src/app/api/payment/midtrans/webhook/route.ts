import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_id, transaction_status } = body;

  if (!order_id || !transaction_status) {
    return NextResponse.json({ message: "Missing data" }, { status: 400 });
  }

  const statusMap: Record<string, "BERHASIL" | "GAGAL" | "PENDING"> = {
    settlement: "BERHASIL",
    capture: "BERHASIL",
    deny: "GAGAL",
    cancel: "GAGAL",
    expire: "GAGAL",
    pending: "PENDING",
  };

  const statusPembayaran = statusMap[transaction_status] || "PENDING";

  try {
    const updated = await prisma.pembayaran.updateMany({
      where: {
        qrisInvoiceId: order_id,
        metodePembayaran: "QRIS_DINAMIS",
      },
      data: {
        statusPembayaran,
        updatedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ message: "No pembayaran matched" }, { status: 404 });
    }

    return NextResponse.json({ message: "Pembayaran updated" });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Failed to update pembayaran" }, { status: 500 });
  }
}
