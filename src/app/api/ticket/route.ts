//api/ticket/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // sesuaikan path sesuai struktur
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Ambil semua data tiket
export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        konser: true,
        kategori: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const response = NextResponse.json(tickets);
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;
  } catch (error) {
    console.error("Gagal mengambil tiket:", error);
    return NextResponse.json({ error: "Gagal ambil data" }, { status: 500 });
  }
}

  export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("❌ User belum login atau session invalid");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("🚀 Payload yang diterima API:", body);

    const {
      konserId,
      kategoriId,
      seat,
      tipeTempat,
      harga_awal,
      batas_waktu,
      harga_beli,
      kelipatan,
      perpanjangan_bid,
      deskripsi,
      jumlah,
      statusLelang,
      sebelahan,
    } = body;

    try {
      const konser = await prisma.konser.findFirst({ where: { id: konserId } });
      const kategori = await prisma.kategori.findFirst({ where: { id: kategoriId } });

      if (!konser || !kategori) {
        console.log("❌ Konser atau kategori tidak ditemukan");
        return NextResponse.json({ message: "Konser/Kategori tidak ditemukan" }, { status: 404 });
      }

      const newTicket = await prisma.ticket.create({
        data: {
          seat,
          tipeTempat,
          harga_awal: harga_awal ? Number(harga_awal) : null,
          batas_waktu: batas_waktu ? new Date(batas_waktu) : null,
          harga_beli: harga_beli ? Number(harga_beli) : null,
          kelipatan: kelipatan ? Number(kelipatan) : null,
          perpanjangan_bid: perpanjangan_bid ?? null,
          konserId: konser.id,
          kategoriId: kategori.id,
          deskripsi,
          userId: Number(session.user.id),
          jumlah: parseInt(jumlah),
          statusLelang: statusLelang ?? "BERLANGSUNG",
          sebelahan: sebelahan ?? false,
        },
      });

      console.log("✅ Tiket berhasil dibuat:", newTicket);

      return NextResponse.json(newTicket, { status: 201 });
    } catch (error: any) {
      console.error("❌ ERROR saat membuat tiket:", error);
return NextResponse.json({ message: "Gagal tambah tiket", error: error }, { status: 500 });

    }
  }


export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}