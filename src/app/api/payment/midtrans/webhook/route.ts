import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import axios from "axios";

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

    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    const signatureHeader = req.headers.get("x-callback-signature");
    console.log("🔑 Signature dari header:", signatureHeader);

    const expectedSignature = crypto
      .createHmac("sha512", MIDTRANS_SERVER_KEY)
      .update(rawBody)
      .digest("hex");

    console.log("🔐 Signature yang dihitung:", expectedSignature);
    console.log("📦 Raw body:", rawBody);

    if (signatureHeader !== expectedSignature) {
      console.warn("❌ Signature tidak cocok");
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 403 }
      );
    }

    const { order_id, transaction_status, status_code, gross_amount } = body;

    if (!order_id || !transaction_status || !status_code || !gross_amount) {
      console.warn("⚠️ Data tidak lengkap");
      return NextResponse.json(
        { message: "Missing required data" },
        { status: 400 }
      );
    }

    const statusPembayaran = statusMap[transaction_status] || "PENDING";
    console.log("✅ statusPembayaran hasil mapping:", statusPembayaran);

    // Simpan log payload ke WebhookLog (opsional tapi disarankan)
    await prisma.webhookLog.create({ data: { payload: body } });

    const updated = await prisma.pembayaran.updateMany({
      where: { order_id },
      data: {
        statusPembayaran,
        updatedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { message: "No pembayaran matched" },
        { status: 404 }
      );
    }

    // Ambil detail pembayaran
    const pembayaran = await prisma.pembayaran.findFirst({
      where: { order_id },
      include: {
        ticket: {
          include: {
            konser: true,
            kategori: true,
          },
        },
        buyer: true,
      },
    });

    if (!pembayaran) {
      return NextResponse.json(
        { message: "Pembayaran tidak ditemukan (2nd fetch)" },
        { status: 404 }
      );
    }

    // Setelah pembayaran valid, baru bisa akses relasinya
    const konser = pembayaran.ticket.konser;
    const kategori = pembayaran.ticket.kategori;
    const buyer = pembayaran.buyer;

    const waktuBayar = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    });
    const tanggalKonser = new Date(konser.tanggal).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const linkKonfirmasi = `${process.env.BASE_URL}/pembayaran/${pembayaran.id}/konfirmasi`;

    // Update status tiket
    if (
      statusPembayaran === "BERHASIL" &&
      pembayaran.ticket.statusLelang !== "SELESAI"
    ) {
      await prisma.ticket.update({
        where: { id: pembayaran.ticketId },
        data: { statusLelang: "SELESAI" },
      });
    }

    if (
      statusPembayaran === "GAGAL" &&
      pembayaran.ticket.statusLelang === "BOOKED"
    ) {
      await prisma.ticket.update({
        where: { id: pembayaran.ticketId },
        data: { statusLelang: "BERLANGSUNG" },
      });
    }

    // Notifikasi dan aktivitas
    const pesan =
  statusPembayaran === "BERHASIL"
    ? `Hai ${buyer?.name || "Sobat YUKNAWAR"} 👋

Makasih banget udah menyelesaikan pembayaran di *YUKNAWAR*! 🎉
Berikut ini rincian pemesanan kamu:

🧾 *Order ID:* ${pembayaran.order_id}
⏰ *Waktu Pembayaran Berhasil:* ${waktuBayar}

🎤 *${konser.nama}*
📅 ${tanggalKonser}
📍 ${konser.lokasi}${konser.venue ? " - " + konser.venue : ""}

🎟️ Kategori: ${kategori?.nama}
🔢 Jumlah Tiket: ${pembayaran.ticket.jumlah}

✅ Untuk lanjut konfirmasi ke penjual, kamu bisa klik link ini ya (login dulu kalau belum):
🔗 ${linkKonfirmasi}

⚠️ Pastikan kamu hanya hubungi nomor yang tertera di platform kami ya, biar aman dari penipuan.

Thank you for trusting us! 🎫`
    : `⚠️ Pembayaran kamu gagal untuk tiket konser *${konser.nama}*.`;


    await prisma.notifikasi.create({
      data: {
        userId: pembayaran.buyerId,
        pesan,
        link: `/pembayaran/${pembayaran.id}`,
      },
    });

    await prisma.aktivitas.create({
      data: {
        userId: pembayaran.buyerId,
        aksi: "WEBHOOK_PEMBAYARAN",
        detail: `Status pembayaran order ${order_id} menjadi ${statusPembayaran}`,
      },
    });

    // 7. 📲 Kirim WhatsApp via Wablas
    try {
      const waPayload = {
        data: [
          {
            phone: pembayaran.buyer?.phoneNumber, // pastikan user punya phoneNumber
            message: pesan,
          },
        ],
      };

      const waRes = await axios.post(
        "https://bdg.wablas.com/api/v2/send-message",
        waPayload,
        {
          headers: {
            Authorization: process.env.WABLAS_TOKEN!, // pastikan ada token
            "Content-Type": "application/json",
          },
        }
      );

      if (!waRes.data.status) {
        console.warn("⚠️ Gagal kirim WA:", waRes.data);
      } else {
        console.log("✅ WA berhasil dikirim");
      }
    } catch (waError) {
      console.error("❌ Error kirim WA:", waError);
    }

    return NextResponse.json({ message: "Pembayaran updated" });
  } catch (err) {
    console.error("🔥 Webhook Error:", err);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
