// File: src/app/api/notifikasi/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const notifId = params.id;

  const updated = await prisma.notifikasi.update({
    where: { id: notifId },
    data: { isRead: true },
  });

  return NextResponse.json(updated);
}
