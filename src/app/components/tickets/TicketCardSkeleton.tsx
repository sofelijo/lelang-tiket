import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";



export default function TicketCardSkeleton() {
  return (
    <Card className="flex items-start gap-4 p-4 rounded-xl border border-yellow-200 bg-yellow-50 shadow animate-pulse">
      {/* Gambar konser */}
      <div className="w-[100px] h-[80px] sm:w-[120px] sm:h-[90px] bg-pink-100 rounded-md flex items-center justify-center text-2xl">
      <div className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center animate-bounce text-lg">
        🎉
      </div>
      </div>

      {/* Detail konser */}
      <div className="flex flex-col gap-2 flex-1 text-sm">
        <div className="w-3/4 h-4 rounded bg-blue-200 flex items-center justify-start pl-2 text-xs opacity-60">
        
        </div>
        <div className="w-1/2 h-4 rounded bg-green-200 flex items-center justify-start pl-2 text-xs opacity-60">
         
        </div>
        <div className="w-2/3 h-4 rounded bg-purple-200 flex items-center justify-start pl-2 text-xs opacity-60">
         
        </div>
      </div>

      {/* Emoji confetti bounce kanan */}
   
    </Card>
  );
}


