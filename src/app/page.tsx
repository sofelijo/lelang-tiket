import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  const tickets = [
    {
      id: 1,
      artist: "BLACKPINK WORLD TOUR",
      venue: "Jakarta International Stadium",
      date: "24 Mei 2025",
      price: "Rp2.500.000",
      timeLeft: "2 jam 14 menit",
    },
    {
      id: 2,
      artist: "Coldplay Music of The Spheres",
      venue: "Stadion Utama GBK",
      date: "30 Juni 2025",
      price: "Rp3.200.000",
      timeLeft: "5 jam 20 menit",
    },
    {
      id: 3,
      artist: "Taylor Swift | The Eras Tour",
      venue: "Singapore National Stadium",
      date: "15 Juli 2025",
      price: "Rp4.800.000",
      timeLeft: "1 hari 3 jam",
    },
    {
      id: 4,
      artist: "NCT Nation World Tour",
      venue: "ICE BSD City",
      date: "10 Agustus 2025",
      price: "Rp1.750.000",
      timeLeft: "3 jam 50 menit",
    },
  ];

  return (
    
    <div className="bg-red-500 text-white p-4">
  Ini seharusnya latar belakangnya merah
</div>

    
  );
  
}

