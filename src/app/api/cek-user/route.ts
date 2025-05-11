
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");

  try {
    let exists = false;

    if (username) {
      const user = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
      });
      exists = !!user;
    }

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      exists = !!user;
    }

    if (phone) {
      const user = await prisma.user.findUnique({
        where: { phoneNumber: phone },
      });
      exists = !!user;
    }

    return NextResponse.json({ exists });
  } catch (err) {
    console.error("❌ Error cek user:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
