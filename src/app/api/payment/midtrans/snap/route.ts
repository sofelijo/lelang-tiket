import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import midtransClient from "midtrans-client";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pembayaranId } = await req.json();

  const pembayaran = await prisma.pembayaran.findUnique({
    where: { id: Number(pembayaranId) },
  
    include: {
      ticket: {
        include: {
          konser: true,
          user: true,
        },
      },
    },
  });

  if (!pembayaran || !pembayaran.ticket) {
    return NextResponse.json({ error: "Pembayaran atau tiket tidak ditemukan" }, { status: 404 });
  }

  // Gunakan order_id dari tabel pembayaran
  const orderId = pembayaran.order_id;
  const ticket = pembayaran.ticket;
  const harga = ticket.harga_beli || 0;
  const feePlatform = Math.max(Math.ceil(harga * 0.03), 27000); // minimal fee 27rb
  const feeMidtrans = 10000;
  const total = harga + feePlatform + feeMidtrans;

  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
  });

  // Waktu mulai transaksi (buffer 1 menit)
  const jakartaTime = new Date(Date.now() + 60_000).toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).replace(",", "");

  const [mm, dd, yyyy, hh, mi, ss] = jakartaTime
    .match(/\d+/g)!
    .map((v) => v.padStart(2, "0"));
  const startTime = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;

  // Update metode pembayaran menjadi "MIDTRANS"
  await prisma.pembayaran.update({
    where: { id: pembayaran.id },
    data: {
      metodePembayaran: "MIDTRANS",
    },
  });

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: total,
    },
    item_details: [
      {
        id: `${ticket.id}`,
        name: `Tiket Konser: ${ticket.konser.nama}`,
        quantity: 1,
        price: total,
      },
    ],
    customer_details: {
      first_name: ticket.user?.name || "User",
      email: ticket.user?.email || "user@example.com",
    },
    expiry: {
      start_time: `${startTime} +0700`,
      unit: "minute",
      duration: 30,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    console.error("Midtrans Snap Error:", error);
    return NextResponse.json({ error: "Gagal membuat Snap Token" }, { status: 500 });
  }
}
