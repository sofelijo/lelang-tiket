import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

function generateRandomUsername(): string {
  const prefix = "user";
  const random = Math.floor(1000 + Math.random() * 9000); // user1234
  return `${prefix}${random}`;
}

export async function POST(req: NextRequest) {
  const { phone, otp } = await req.json();

  const record = await prisma.otpLogin.findFirst({
    where: {
      phone,
      code: otp,
      isUsed: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!record) {
    return NextResponse.json(
      { error: "OTP tidak valid atau sudah kadaluarsa" },
      { status: 400 }
    );
  }

  await prisma.otpLogin.update({
    where: { id: record.id },
    data: { isUsed: true },
  });

  let user = await prisma.user.findUnique({
    where: { phoneNumber: phone },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phoneNumber: phone,
        name: "Pengguna Baru",
        username: generateRandomUsername(),
        isVerified: true,
      },
    });
  }

  // Set session cookie sementara (bisa diganti dengan JWT)
  const cookieStore = await cookies();
  cookieStore.set("user_id", user.id.toString(), {
  
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ success: true });
}
