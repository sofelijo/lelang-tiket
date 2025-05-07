// 📁 /app/api/auth/otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpToWhatsapp } from "@/lib/whatsapp"; // 🔧 kamu harus buat ini sendiri

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json({ message: "Nomor WhatsApp tidak valid" }, { status: 400 });
    }

    // Cari user berdasarkan session
    const user = await prisma.user.findFirst({ where: { phoneNumber } });

    // Generate OTP (4 digit)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Simpan OTP ke tabel OTPLogin
    await prisma.otpLogin.create({
      data: {
        phone: phoneNumber,
        code: otp,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 menit
        isUsed: false,
      },
    });

    // Kirim OTP ke WhatsApp (implementasi custom di file @/lib/whatsapp.ts)
    await sendOtpToWhatsapp(phoneNumber, otp);

    // Jika user belum ada, tidak apa-apa. Akan diverifikasi nanti
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gagal kirim OTP:", error);
    return NextResponse.json({ message: "Gagal mengirim OTP" }, { status: 500 });
  }
}
