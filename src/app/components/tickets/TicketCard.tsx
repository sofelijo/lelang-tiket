import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Ticket } from "lucide-react";
import Image from "next/image";

interface TicketCardProps {
  namaKonser: string;
  tanggal: string;
  lokasi?: string;
  jumlahTiket?: number;
  tipeTempat?: string;
  harga?: number;
  venue?: string;
  image?: string | null; // ✅ tambahkan prop image
  onClick?: () => void;
  onDoubleClick?: () => void; // ✅ tambahkan ini

  className?: string;
}

export default function TicketCard({
  namaKonser,
  tanggal,
  lokasi,
  jumlahTiket,
  tipeTempat,
  harga,
  venue,
  image,
  onClick,
  onDoubleClick,
  className,
}: TicketCardProps) {
  return (
    <Card
      onClick={onClick}
      onDoubleClick={onDoubleClick} // ✅ tambahkan ini 
      className={`flex flex-row w-full overflow-hidden hover:shadow-lg transition-all duration-200 ease-in-out rounded-2xl cursor-pointer ${className}`}
    >
      {/* Gambar kiri (1/3) */}
      <div className="w-1/3 relative aspect-square bg-gray-200">
        {image ? (
          <Image
            src={image}
            alt={`Gambar konser ${namaKonser}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
            No Image
          </div>
        )}
      </div>

      {/* Konten kanan (2/3) */}
      <div className="w-2/3 p-4 flex flex-col justify-center gap-2">
        <div className="text-lg font-bold flex line-clamp-1">{namaKonser}</div>

        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{tanggal}</span>
        </div>

        {lokasi && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{venue ?? "-"} </span>
          </div>
        )}

        {harga !== undefined && (
          <div className="text-base font-semibold text-green-600 mt-2">
            Rp {harga.toLocaleString("id-ID")}
          </div>
        )}
      </div>
    </Card>
  );

}
