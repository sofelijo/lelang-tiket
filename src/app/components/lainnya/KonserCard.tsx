"use client"

import { Card, CardContent } from "@/components/ui/card"

type Ticket = {
  id: number
  tipeTempat: string
  harga_awal: number
  statusLelang: string
}

type Konser = {
  id: number
  nama: string
  tanggal: string
  tiket: Ticket[]
}

export default function KonserCard({ konser }: { konser: Konser }) {
  return (
    <Card key={konser.id} className="mb-4">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold">{konser.nama}</h2>
        <p className="text-sm text-muted-foreground">
          {new Date(konser.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {konser.tiket.length > 0 ? (
          <ul className="mt-2 list-disc list-inside">
            {konser.tiket.map((t) => (
              <li key={t.id}>
                {t.tipeTempat} - Rp{t.harga_awal.toLocaleString("id-ID")} ({t.statusLelang})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">Tidak ada tiket dilelang untuk konser ini.</p>
        )}
      </CardContent>
    </Card>
  )
}
