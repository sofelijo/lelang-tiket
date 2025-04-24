import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type Konser = {
  id: number
  nama: string
  tanggal: string
  tiket: {
    id: number
    tipeTempat: string
    harga_awal: number
    statusLelang: string
  }[]
}

type Props = {
  onSearch: (results: Konser[]) => void
}

export default function SearchConcert({ onSearch }: Props) {
  const [query, setQuery] = useState("")

  const handleSearch = async () => {
    if (!query) return
    try {
        //const res = await fetch(`/api/search?query=${query}`)
        // const res = await fetch("/api/search?query=konserku", {
        //     method: "GET",
        //   })
        const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`, {
            method: "GET",
          })
          
          
      const data = await res.json()
      onSearch(data) // lempar hasil ke parent
    } catch (err) {
      console.error("Gagal cari konser:", err)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Nama konser..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button onClick={handleSearch}>Cari</Button>
    </div>
  )
}
