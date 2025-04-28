// app/components/BuyTicketModal.tsx

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BuyTicketModalProps {
  open: boolean;
  onClose: () => void;
  ticketId: string;
}

export default function BuyTicketModal({ open, onClose, ticketId }: BuyTicketModalProps) {
  const [isBuying, setIsBuying] = useState(false);

  const handleBuyNow = async () => {
    if (!ticketId) {
      alert("ID tiket tidak valid.");
      return;
    }

    setIsBuying(true);

    try {
      const response = await fetch("/api/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal membeli tiket");
      }

      alert("🎉 Tiket berhasil dibeli!");
      onClose(); // Tutup modal setelah sukses
    } catch (error) {
      console.error(error);
      alert((error as Error).message || "Terjadi kesalahan saat membeli tiket");
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembelian</DialogTitle>
          <DialogDescription>Apakah Anda yakin ingin membeli tiket ini?</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 mt-4">
          <Button variant="secondary" onClick={onClose} disabled={isBuying}>
            Batal
          </Button>
          <Button variant="default" onClick={handleBuyNow} disabled={isBuying}>
            {isBuying ? "Memproses..." : "Beli Sekarang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
