// src/app/api/notifikasi/add/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, pesan, link } = await req.json();

    console.log("📥 Data diterima:", { userId, pesan, link });

    if (!userId || !pesan || !link) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const notif = await prisma.notifikasi.create({
      data: {
        userId: Number(userId),
        pesan,
        link,
      },
    });

    return NextResponse.json(notif);
  } catch (error: any) {
    console.error("❌ Gagal buat notifikasi:", error);
    return NextResponse.json({ message: error.message || "Internal error" }, { status: 500 });
  }
}
