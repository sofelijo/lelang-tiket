// src/pages/api/search2.ts
import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  if (typeof query !== "string") {
    return res.status(400).json({ error: "Invalid query" });
  }

  try {
    const konserList = await prisma.konser.findMany({
      where: {
        nama: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        tiket: true,
      },
    });

    return res.status(200).json(konserList);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
