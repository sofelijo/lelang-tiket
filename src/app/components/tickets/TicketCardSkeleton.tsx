import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TicketCardSkeleton() {
  return (
    <Card className="p-4 flex flex-col gap-3 rounded-2xl">
      <Skeleton className="h-5 w-3/4" /> {/* Judul konser */}
      <Skeleton className="h-4 w-1/2" /> {/* Tanggal */}
      <Skeleton className="h-4 w-1/3" /> {/* Lokasi */}
      <Skeleton className="h-4 w-1/2" /> {/* Info tiket */}
      <Skeleton className="h-6 w-1/4" /> {/* Harga */}
      <Skeleton className="h-10 w-full mt-2" /> {/* Tombol */}
    </Card>
  );
}
