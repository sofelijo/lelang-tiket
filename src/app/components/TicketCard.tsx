import Image from "next/image";

interface TicketProps {
  id: number;
  artist: string;
  venue: string;
  date: string;
  price: string;
  timeLeft: string;
  image: string;
}

export default function TicketCard({
  id,
  artist,
  venue,
  date,
  price,
  timeLeft,
  image,
}: TicketProps) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <Image
        src={image}
        alt={artist}
        width={500}
        height={300}
        className="rounded mb-4 object-cover"
      />
      <h2 className="text-xl font-semibold">{artist}</h2>
      <p>{venue}</p>
      <p>{date}</p>
      <p>Harga Saat Ini: {price}</p>
      <p>Sisa Waktu: {timeLeft}</p>
      <button
        className="mt-2 bg-indigo-500 px-4 py-1 rounded text-white"
        onClick={() => window.open(`/ticket/${id}`, "_blank")}
      >
        Tawar Sekarang
      </button>
    </div>
  );
}
