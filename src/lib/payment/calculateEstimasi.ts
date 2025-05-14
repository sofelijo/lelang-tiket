export type MetodePembayaran = "qris" | "credit_card" | "bank_transfer" | "cstore";

interface Bid {
  amount: number;
}

interface Ticket {
  id: number;
  kelipatan: number | null;
  harga_beli: number | null;
  harga_awal: number | null;
  jumlah: number;
  statusLelang: string;
  bids: Bid[];
}

export function calculateEstimasi(
  ticket: Ticket,
  metodeKey: MetodePembayaran = "bank_transfer",
  overrideHargaDasar: number | null = null
) {
  const FEE_PLATFORM_PERCENT = 0.03;
  const FEE_PLATFORM_MIN = 13000;
  const KODE_UNIK = 999;

  const FEE_METODE: Record<MetodePembayaran, { persen: number; tetap: number }> = {
    qris: { persen: 0.01, tetap: 2000 },
    credit_card: { persen: 0.05, tetap: 5000 },
    bank_transfer: { persen: 0, tetap: 10000 },
    cstore: { persen: 0, tetap: 10000 },
  };

  const lastBid = [...(ticket.bids || [])].sort((a, b) => b.amount - a.amount)[0];

  let hargaTiket = 0;
  if (overrideHargaDasar !== null && !isNaN(overrideHargaDasar)) {
    hargaTiket = overrideHargaDasar;
  } else if (ticket.kelipatan === null) {
    hargaTiket = ticket.harga_beli ?? 0;
  } else if (ticket.statusLelang === "SELESAI") {
    hargaTiket = lastBid?.amount ?? ticket.harga_awal ?? 0;
  } else {
    hargaTiket = ticket.harga_beli ?? 0;
  }

  const feeConfig = FEE_METODE[metodeKey];
  const feePlatform = Math.max(
    Math.ceil(hargaTiket * FEE_PLATFORM_PERCENT),
    FEE_PLATFORM_MIN
  );
  const feeMetode = Math.ceil(hargaTiket * feeConfig.persen);
  const feeTransaksi = feeConfig.tetap;
  const totalBayar = hargaTiket + feePlatform + feeMetode + feeTransaksi + KODE_UNIK;
  const hargaPerTiket = Math.floor(totalBayar / (ticket.jumlah || 1));

  return {
    ticketId: ticket.id,
    metode: metodeKey,
    hargaTiket,
    jumlah: ticket.jumlah,
    feePlatform,
    feeMetode,
    feeTransaksi,
    kodeUnik: KODE_UNIK,
    totalBayar,
    hargaPerTiket,
  };
}
