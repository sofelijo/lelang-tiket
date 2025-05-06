import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

const WABLAS_TOKEN = process.env.WABLAS_TOKEN!;
const WABLAS_URL = "https://console.wablas.com/api/send-message";

function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  if (!phone || !phone.startsWith("62")) {
    return NextResponse.json({ error: "Nomor WA tidak valid" }, { status: 400 });
  }

  const code = generateOTP();

  try {
    // Simpan ke DB
    await prisma.otpLogin.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 menit
      },
    });

    // Kirim via Wablas
    const message = `Kode login MOMEN kamu: ${code}.\nBerlaku 5 menit yaa. Jangan kasih ke siapa pun!`;

    await axios.post(
      WABLAS_URL,
      {
        phone,
        message,
      },
      {
        headers: {
          Authorization: WABLAS_TOKEN,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Gagal kirim WA:", err);
    return NextResponse.json({ error: "Gagal kirim WhatsApp" }, { status: 500 });
  }
}
