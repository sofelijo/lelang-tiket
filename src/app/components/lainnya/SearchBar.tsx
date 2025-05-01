'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-white rounded-xl shadow">
      <Search className="text-gray-400" size={20} />
      <Input
        type="text"
        placeholder="Cari konser..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </form>
  )
}
