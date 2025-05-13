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
  const metodeSnap = metode?.toLowerCase() || "bank_transfer";

  const pembayaran = await prisma.pembayaran.findUnique({
    where: { id: Number(pembayaranId) },
    include: {
      buyer: {
        select: {
          name: true,
          email: true,
          phoneNumber: true,
        },
      },
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

  if (!pembayaran.order_id) {
    return NextResponse.json({ error: "Order ID tidak tersedia" }, { status: 400 });
  }

  const ticket = pembayaran.ticket;
  const hargaTiket = ticket.harga_beli ?? 0;
  const feePlatform = pembayaran.feePlatform ?? 0;
  const feeMetode = pembayaran.feeMetode ?? 0;
  const feeFlat = pembayaran.feeMetodeFlat ?? 0;
  const kodeUnik = pembayaran.kodeUnik ?? 0;

  const total = hargaTiket + feePlatform + feeMetode + feeFlat + kodeUnik;

  const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
  });

  const now = new Date();
  const jakartaTime = now.toLocaleString("en-US", {
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
  const expiredAt = new Date(now.getTime() + 30 * 60 * 1000);

  const parameter: any = {
    transaction_details: {
      order_id: pembayaran.order_id,
      gross_amount: total,
    },
    enabled_payments: [metodeSnap],
    item_details: [
      {
        id: `item_tiket_${ticket.id}`,
        name: `Tiket ${ticket.konser.nama}`,
        quantity: 1,
        price: hargaTiket,
      },
      {
        id: `item_platform`,
        name: "Fee Platform",
        quantity: 1,
        price: feePlatform,
      },
      {
        id: `item_fee_persen`,
        name: "Fee Payment (Persen)",
        quantity: 1,
        price: feeMetode,
      },
      {
        id: `item_fee_flat`,
        name: "Fee Transaksi Tetap",
        quantity: 1,
        price: feeFlat,
      },
      {
        id: `item_kode_unik`,
        name: "Kode Unik",
        quantity: 1,
        price: kodeUnik,
      },
    ],
    customer_details: {
      first_name: pembayaran.buyer?.name || "User",
      email: pembayaran.buyer?.email || "user@example.com",
      phone: pembayaran.buyer?.phoneNumber || "081234567890",
    },
    
    expiry: {
      start_time: `${startTime} +0700`,
      unit: "minute",
      duration: 30,
    },
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_BASE_URL}/pembayaran/status`,
    },
  };

  if (metodeSnap === "credit_card") {
    parameter.credit_card = { secure: true };
  }

  try {
    const transaction = await snap.createTransaction(parameter);

    await prisma.$transaction([
      prisma.pembayaran.update({
        where: { id: pembayaran.id },
        data: {
          snapToken: transaction.token,
          qrisExpiredAt: expiredAt,
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
