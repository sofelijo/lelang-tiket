import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(params.id) },
    });
    if (!banner) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(banner);
  } catch {
    return NextResponse.json({ message: "Error fetching banner" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.banner.update({
      where: { id: parseInt(params.id) },
      data: {
        title: body.title,
        imageUrl: body.imageUrl,
        link: body.link,
        isActive: body.isActive,
        urutan: body.urutan,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.banner.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}
