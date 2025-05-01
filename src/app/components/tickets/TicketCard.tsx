import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Ticket } from "lucide-react";

interface TicketCardProps {
  namaKonser: string;
  tanggal: string;
  lokasi?: string;
  jumlahTiket?: number;
  tipeTempat?: string;
  harga?: number;
  onClick?: () => void;
  className?: string;
}

export default function TicketCard({
  namaKonser,
  tanggal,
  lokasi,
  jumlahTiket,
  tipeTempat,
  harga,
  onClick,
  className,
}: TicketCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`p-4 flex flex-col gap-2 hover:shadow-lg transition-all duration-200 ease-in-out rounded-2xl cursor-pointer ${className}`}
    >
      <div className="text-lg font-bold">{namaKonser}</div>

      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span>{tanggal}</span>
      </div>

      {lokasi && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{lokasi}</span>
        </div>
      )}

      {jumlahTiket !== undefined && tipeTempat && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Ticket className="w-4 h-4" />
          <span>
            {jumlahTiket} tiket - {tipeTempat}
          </span>
        </div>
      )}

      {harga !== undefined && (
        <div className="text-base font-semibold text-green-600">
          Rp {harga.toLocaleString("id-ID")}
        </div>
      )}
    </Card>
  );
}