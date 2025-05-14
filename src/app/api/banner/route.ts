import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { urutan: "asc" },
    });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newBanner = await prisma.banner.create({
      data: {
        title: body.title,
        imageUrl: body.imageUrl,
        link: body.link,
        isActive: body.isActive ?? true,
        urutan: body.urutan ?? 0,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });
    return NextResponse.json(newBanner);
  } catch (error) {
    return NextResponse.json({ message: "Failed to create banner" }, { status: 500 });
  }
}
