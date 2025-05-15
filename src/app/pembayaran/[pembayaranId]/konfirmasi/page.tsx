// src/app/pembayaran/[pembayaranId]/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Stepper } from "@/components/payment/Stepper";
import { Separator } from "@/components/ui/separator";
import Pembayaran from "./KonfirmasiClient";

interface PageProps {
  params: { pembayaranId: string };
}

export default async function PembayaranPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const pembayaranId = params.pembayaranId;

  if (!session) {
    redirect("/login");
  }

  const pembayaran = await prisma.pembayaran.findUnique({
    where: { id: pembayaranId },
    include: {
      ticket: true,
    },
  });

  if (!pembayaran) {
    redirect("/404");
  }

  const userId = session.user.id;
  const isBuyer = userId === pembayaran.buyerId;
  const isSeller = userId === pembayaran.ticket.userId;
  const isAdmin = session.user.role === "ADMIN";

  if (!isBuyer && !isSeller && !isAdmin) {
    redirect("/unauthorized");
  }

  return <Pembayaran  />;
}

