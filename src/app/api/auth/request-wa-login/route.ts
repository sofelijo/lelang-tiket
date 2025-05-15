import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";

const WABLAS_URL = "https://bdg.wablas.com/api/v2/send-message";

function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json();

  if (!phone || !phone.startsWith("62")) {
    return NextResponse.json({ error: "Nomor tidak valid" }, { status: 400 });
  }

  // ⏱ Cek apakah OTP sebelumnya dikirim < 1 menit yang lalu
  const recentOtp = await prisma.otpLogin.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });

  if (
    recentOtp &&
    Date.now() - new Date(recentOtp.createdAt).getTime() < 60 * 1000
  ) {
    return NextResponse.json(
      { error: "Tunggu sebentar sebelum kirim ulang OTP." },
      { status: 429 }
    );
  }

  const code = generateOTP();

  try {
    // 1. Simpan OTP ke database
    await prisma.otpLogin.create({
      data: {
        phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 menit
      },
    });

    // 2. Kirim ke WhatsApp via Wablas
    const message = `Kode login YUKNAWAR kamu: ${code}.\nBerlaku 5 menit yaa ✨`;

    const payload = {
      data: [
        {
          phone,
          message,
        },
      ],
    };

    const response = await axios.post(WABLAS_URL, payload, {
      headers: {
        Authorization: process.env.WABLAS_TOKEN!, // pastikan ada "Bearer ..."
        "Content-Type": "application/json",
      },
    });

    if (!response.data.status) {
      console.error("⚠️ Wablas error:", response.data);
      return NextResponse.json(
        { error: "Gagal kirim OTP ke WhatsApp" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP berhasil dikirim!",
    });
  } catch (err) {
    console.error("❌ Gagal kirim WA:", err);
    return NextResponse.json(
      { error: "Gagal mengirim WhatsApp" },
      { status: 500 }
    );
  }
}
