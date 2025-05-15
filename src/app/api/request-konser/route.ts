// src/app/api/request-konser/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { nama, lokasi, tanggal, venue, deskripsi, image, kategoriIds } = await req.json();

  const newRequest = await prisma.requestKonser.create({
    data: {
      nama,
      lokasi,
      tanggal: tanggal ? new Date(tanggal) : null,
      venue,
      deskripsi,
      image,
      kategoriIds,
      userId: session.user.id,
    },
  });

  return NextResponse.json(newRequest);
}

export async function GET() {
  const allRequests = await prisma.requestKonser.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { name: true, username: true } },
      likes: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(allRequests);
}
