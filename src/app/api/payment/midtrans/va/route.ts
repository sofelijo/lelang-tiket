// app/api/payment/midtrans/snap/route.ts

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

  const { pembayaranId, metode } = await req.json();

  const metodeValid = ["credit_card", "qris", "bank_transfer", "cstore"];
  if (!metode || !metodeValid.includes(metode)) {
    return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
  }

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

  const ticket = pembayaran.ticket;
  const harga = ticket.harga_beli || 0;
  const feePlatform = Math.max(Math.ceil(harga * 0.03), 27000);

  let feeMetode = 0;
  if (metode === "credit_card") {
    feeMetode = Math.ceil(harga * 0.05) + 5000;
  } else if (metode === "qris") {
    feeMetode = Math.ceil(harga * 0.01);
  } else if (metode === "bank_transfer" || metode === "cstore") {
    feeMetode = 10000;
  }

  const kodeUnik = Math.floor(100 + Math.random() * 900);
  const total = harga + feePlatform + feeMetode + kodeUnik;

  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
  });

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

  const [mm, dd, yyyy, hh, mi, ss] = jakartaTime.match(/\d+/g)!.map((v) => v.padStart(2, "0"));
  const startTime = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  const expiredAt = new Date(`${startTime.replace(/-/g, "/").replace(" ", "T")}+07:00`).getTime() + 30 * 60 * 1000;

  const parameter = {
    transaction_details: {
      order_id: pembayaran.order_id,
      gross_amount: total,
    },
    enabled_payments: [metode],
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

    await prisma.$transaction([
      prisma.pembayaran.update({
        where: { id: pembayaran.id },
        data: {
          snapMethod: metode,
          qrisExpiredAt: new Date(expiredAt),
          feePlatform,
          feeMetode,
          kodeUnik,
          jumlahTotal: total,
        },
      }),
      prisma.ticket.update({
        where: { id: ticket.id },
        data: { statusLelang: "BOOKED" },
      }),
    ]);

    return NextResponse.json({ token: transaction.token });
  } catch (error) {
    console.error("Midtrans Snap Error:", error);
    return NextResponse.json({ error: "Gagal membuat Snap Token" }, { status: 500 });
  }
}
