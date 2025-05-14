import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import TambahTiketClient from "./TicketClient";
import { prisma } from "@/lib/prisma";

export default async function TambahTiketPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },

  });
  
  if (!user?.isVerified) redirect("/verifikasi-wa");
 

  return <TambahTiketClient />;
}
