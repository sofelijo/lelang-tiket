import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const itemIdParam = req.nextUrl.searchParams.get("itemId");
  const itemType = req.nextUrl.searchParams.get("itemType"); // 'ticket' atau 'konser'
  const itemId = itemIdParam ? parseInt(itemIdParam) : null;

  if (!itemId || !itemType) {
    return NextResponse.json({ message: "itemId dan itemType diperlukan" }, { status: 400 });
  }

  try {
    const whereCondition =
      itemType === "ticket"
        ? { ticketId: itemId }
        : itemType === "konser"
        ? { konserId: itemId }
        : null;

    if (!whereCondition) {
      return NextResponse.json({ message: "itemType tidak valid" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("❌ Gagal ambil komentar:", error);
    return NextResponse.json({ message: "Gagal ambil komentar" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { itemId, itemType, content } = await req.json();
  const userId = Number(session.user.id);

  if (!itemId || !itemType || !content) {
    return NextResponse.json({ message: "itemId, itemType, dan content wajib diisi" }, { status: 400 });
  }

  try {
    const data =
      itemType === "ticket"
        ? { ticketId: Number(itemId), userId, content }
        : itemType === "konser"
        ? { konserId: Number(itemId), userId, content }
        : null;

    if (!data) {
      return NextResponse.json({ message: "itemType tidak valid" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("❌ Gagal tambah komentar:", error);
    return NextResponse.json({ message: "Gagal tambah komentar" }, { status: 500 });
  }
}
