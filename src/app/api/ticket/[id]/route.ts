// src/app/api/ticket/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        konser: true,
        kategori: true,
        bids: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true, username: true } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            createdAt: true,
            image: true,
            tickets: {
              where: { statusLelang: "SELESAI" },
              select: { id: true, jumlah: true },
            },
          },
        },
        pemenang: {
          select: { id: true, username: true , image: true},
        }
        
      },
    });

    if (!ticket) {
      return NextResponse.json({ message: "Tiket tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const id = parseInt(params.id);
  console.log("📥 PATCH ticket ID:", id);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);
  console.log("👤 Session userId:", userId);

  const existing = await prisma.ticket.findUnique({
    where: { id },
    include: { konser: true, kategori: true },
  });

  console.log("🎫 Tiket ditemukan:", existing);
  if (!existing || existing.userId == null || existing.userId !== userId) {
    console.log("❌ Tiket bukan milik user atau tidak ditemukan", {
      existingUserId: existing?.userId,
      sessionUserId: userId,
    });
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  if (existing.statusLelang === "BOOKED" || existing.statusLelang === "SELESAI") {
    return NextResponse.json({ message: "Tiket sudah BOOKED atau SELESAI dan tidak bisa diedit." }, { status: 403 });
  }

  const isLelang = existing.kelipatan !== null;

  if (isLelang && existing.statusLelang !== "BERLANGSUNG") {
    return NextResponse.json(
      { message: "Tiket lelang hanya bisa diubah jika status masih BERLANGSUNG." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const batasWaktu = body.batas_waktu ? new Date(body.batas_waktu) : null;

  if (batasWaktu) {
    const maxAllowedDate = new Date(existing.createdAt);
    maxAllowedDate.setDate(maxAllowedDate.getDate() + 7);

    if (batasWaktu > maxAllowedDate) {
      return NextResponse.json(
        { message: "⏰ Batas waktu tidak boleh lebih dari 7 hari sejak tiket dibuat." },
        { status: 400 }
      );
    }
  }

  try {
    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        deskripsi: body.deskripsi,
        batas_waktu: body.batas_waktu ? new Date(body.batas_waktu) : undefined,
        perpanjangan_bid: body.perpanjangan_bid,
        seat: body.seat,
        jumlah: body.jumlah ? Number(body.jumlah) : undefined,
      },
    });

    try {
      await prisma.notifikasi.create({
        data: {
          userId,
          pesan: `🎫 Tiket konser ${existing.konser?.nama ?? "-"} (kategori: ${existing.kategori?.nama ?? "-"}) berhasil kamu update!`,
          link: `/ticket/${id}`,
        },
      });

      await prisma.aktivitas.create({
        data: {
          userId,
          aksi: "UPDATE_TIKET",
          detail: `Update tiket konser ${existing.konser?.nama ?? "-"} (${existing.kategori?.nama ?? "-"})`,
        },
      });
    } catch (logError) {
      console.warn("⚠️ Gagal insert notifikasi/log:", logError);
    }

    console.log(`[LOG] ${new Date().toISOString()} - User ${userId} UPDATE tiket ${id}`);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gagal update:", error);
    return NextResponse.json({ message: "Gagal update tiket" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const id = parseInt(params.id);
  console.log("📥 DELETE ticket ID:", id);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const userId = Number(session.user.id);
  console.log("👤 Session userId:", userId);

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { konser: true, kategori: true },
    });

    console.log("🎫 Tiket ditemukan:", ticket);

    if (!ticket || ticket.userId == null || ticket.userId !== userId) {
      console.log("❌ Gagal hapus, bukan pemilik", {
        ticketUserId: ticket?.userId,
        sessionUserId: userId,
      });
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const isLelang = ticket.kelipatan != null;

    const createdAt = new Date(ticket.createdAt);
    const now = new Date();
    const msDiff = now.getTime() - createdAt.getTime();
    const isUnder1Hour = msDiff < 60 * 60 * 1000;

    if (
      (isLelang && (!isUnder1Hour || ticket.statusLelang !== "BERLANGSUNG")) ||
      ticket.statusLelang === "BOOKED" ||
      ticket.statusLelang === "SELESAI"
    ) {
      return NextResponse.json(
        { message: "Tiket tidak bisa dihapus karena sudah BOOKED/SELESAI atau bukan waktu yang diperbolehkan." },
        { status: 403 }
      );
    }

    await prisma.ticket.delete({ where: { id } });

    try {
      await prisma.notifikasi.create({
        data: {
          userId: ticket.userId!,
          pesan: `❌ Tiket konser ${ticket.konser?.nama ?? "-"} (kategori: ${ticket.kategori?.nama ?? "-"}) telah kamu hapus dari sistem.`,
          link: "/profile/listinguser",
        },
      });

      await prisma.aktivitas.create({
        data: {
          userId: ticket.userId!,
          aksi: "DELETE_TIKET",
          detail: `Hapus tiket konser ${ticket.konser?.nama ?? "-"} (${ticket.kategori?.nama ?? "-"})`,
        },
      });
    } catch (logError) {
      console.warn("⚠️ Gagal insert notifikasi/log:", logError);
    }

    console.log(`[LOG] ${new Date().toISOString()} - User ${ticket.userId} DELETE tiket ${id}`);
    return NextResponse.json({ message: "Tiket berhasil dihapus" });
  } catch (error) {
    console.error("Gagal hapus tiket:", error);
    return NextResponse.json({ message: "Gagal hapus tiket" }, { status: 500 });
  }
}
