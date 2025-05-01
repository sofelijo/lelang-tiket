import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Webhook diterima");

    const body = await req.json();
    console.log("📦 Body JSON:", body);

    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount
    } = body;

    if (!order_id || !transaction_status || !status_code || !gross_amount) {
      console.warn("⚠️ Data tidak lengkap");
      return NextResponse.json({ message: "Missing required data" }, { status: 400 });
    }

    console.log("✅ Data lengkap diterima");
    console.log("🔍 order_id:", order_id);
    console.log("🔍 transaction_status:", transaction_status);
    console.log("🔍 status_code:", status_code);
    console.log("🔍 gross_amount:", gross_amount);

    const statusMap: Record<string, "BERHASIL" | "GAGAL" | "PENDING"> = {
      settlement: "BERHASIL",
      capture: "BERHASIL",
      deny: "GAGAL",
      cancel: "GAGAL",
      expire: "GAGAL",
      pending: "PENDING",
    };

    const statusPembayaran = statusMap[transaction_status] || "PENDING";
    console.log("✅ statusPembayaran hasil mapping:", statusPembayaran);

    const updated = await prisma.pembayaran.updateMany({
      where: {
        order_id: order_id,
      
      },
      data: {
        statusPembayaran,
        updatedAt: new Date(),
      },
    });

    console.log("📊 Jumlah data diperbarui:", updated.count);

    if (updated.count === 0) {
      console.warn("⚠️ Tidak ada pembayaran ditemukan dengan order_id & metode MIDTRANS");
      return NextResponse.json({ message: "No pembayaran matched" }, { status: 404 });
    }

    console.log("✅ Status pembayaran berhasil diperbarui");
    return NextResponse.json({ message: "Pembayaran updated" });

  } catch (err) {
    console.error("🔥 Webhook Error:", err);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
