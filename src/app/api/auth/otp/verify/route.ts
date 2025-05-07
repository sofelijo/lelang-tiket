// 📁 /src/app/api/auth/otp/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { phoneNumber, code } = await req.json();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!phoneNumber || !code) {
      return NextResponse.json({ message: "Nomor WA dan kode OTP wajib diisi" }, { status: 400 });
    }

    const otp = await prisma.otpLogin.findFirst({
      where: {
        phone: phoneNumber,
        code,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      return NextResponse.json({ message: "Kode OTP tidak valid atau sudah kedaluwarsa" }, { status: 400 });
    }

    await prisma.otpLogin.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    // 🔄 Update phoneNumber jika belum ada
    const updated = await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: {
        isVerified: true,
        phoneNumber: phoneNumber, // override atau update
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Gagal verifikasi OTP:", err);
    return NextResponse.json({ message: "Terjadi kesalahan di server" }, { status: 500 });
  }
}
