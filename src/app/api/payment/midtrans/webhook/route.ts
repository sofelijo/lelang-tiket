import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";

const statusMap: Record<string, "BERHASIL" | "GAGAL" | "PENDING" | "REFUND"> = {
  settlement: "BERHASIL",
  capture: "BERHASIL",
  deny: "GAGAL",
  cancel: "GAGAL",
  expire: "GAGAL",
  pending: "PENDING",
  refund: "REFUND",
};

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Webhook diterima");

    const signatureHeader = req.headers.get("x-callback-signature");
    const body = await req.json();
    console.log("📦 Body JSON:", body);

    // 1. ✅ Simpan log ke WebhookLog
    await prisma.webhookLog.create({ data: { payload: body } });

    // 2. 🔐 Validasi signature
    const expectedSignature = crypto
      .createHmac("sha512", MIDTRANS_SERVER_KEY)
      .update(JSON.stringify(body))
      .digest("hex");

    if (signatureHeader !== expectedSignature) {
      console.warn("❌ Signature tidak cocok");
      return NextResponse.json({ message: "Invalid signature" }, { status: 403 });
    }

    const { order_id, transaction_status, status_code, gross_amount } = body;

    if (!order_id || !transaction_status || !status_code || !gross_amount) {
      console.warn("⚠️ Data tidak lengkap");
      return NextResponse.json({ message: "Missing required data" }, { status: 400 });
    }

    console.log("✅ Data lengkap diterima");
    console.log("🔍 order_id:", order_id);
    console.log("🔍 transaction_status:", transaction_status);
    console.log("🔍 status_code:", status_code);
    console.log("🔍 gross_amount:", gross_amount);

    const statusPembayaran = statusMap[transaction_status] || "PENDING";
    console.log("✅ statusPembayaran hasil mapping:", statusPembayaran);

    // 3. ✅ Update pembayaran
    const updated = await prisma.pembayaran.updateMany({
      where: { order_id },
      data: {
        statusPembayaran,
        updatedAt: new Date(),
      },
    });

    console.log("📊 Jumlah data diperbarui:", updated.count);
    if (updated.count === 0) {
      console.warn("⚠️ Tidak ada pembayaran ditemukan dengan order_id");
      return NextResponse.json({ message: "No pembayaran matched" }, { status: 404 });
    }

    // 4. ✅ Cari pembayaran untuk tindakan lanjutan
    const pembayaran = await prisma.pembayaran.findFirst({
      where: { order_id },
      include: {
        ticket: true,
        buyer: true,
      },
    });

    if (!pembayaran) {
      return NextResponse.json({ message: "Pembayaran tidak ditemukan (2nd fetch)" }, { status: 404 });
    }

    // 5. 🎯 Update statusLelang jika diperlukan
    const currentStatus = pembayaran.ticket.statusLelang;

    if (statusPembayaran === "BERHASIL") {
      if (currentStatus !== "SELESAI") {
        await prisma.ticket.update({
          where: { id: pembayaran.ticketId },
          data: { statusLelang: "SELESAI" },
        });
      }
    }

    if (statusPembayaran === "GAGAL" && currentStatus === "BOOKED") {
      await prisma.ticket.update({
        where: { id: pembayaran.ticketId },
        data: { statusLelang: "BERLANGSUNG" },
      });
    }

    // 6. 🔔 Notifikasi ke user
    const pesan =
      statusPembayaran === "BERHASIL"
        ? `🎉 Pembayaran kamu berhasil untuk tiket konser ID ${pembayaran.ticket.konserId}.`
        : `⚠️ Pembayaran kamu gagal untuk tiket konser ID ${pembayaran.ticket.konserId}.`;

    await prisma.notifikasi.create({
      data: {
        userId: pembayaran.buyerId,
        pesan,
        link: `/pembayaran/${pembayaran.id}`,
      },
    });

    // 7. 📝 Catat ke Aktivitas
    await prisma.aktivitas.create({
      data: {
        userId: pembayaran.buyerId,
        aksi: "WEBHOOK_PEMBAYARAN",
        detail: `Status pembayaran order ${order_id} menjadi ${statusPembayaran}`,
      },
    });

    // 8. 📱 Placeholder push WA
    // await sendWA(pembayaran.buyer.phoneNumber, pesan);

    console.log("✅ Status pembayaran berhasil diperbarui dan tindakan lanjutan selesai");
    return NextResponse.json({ message: "Pembayaran updated" });
  } catch (err) {
    console.error("🔥 Webhook Error:", err);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
