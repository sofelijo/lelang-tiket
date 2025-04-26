//app/components/buyticketmodal.tsx
'use client';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BuyTicketModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isBuying: boolean;
}

export default function BuyTicketModal({ open, onClose, onConfirm, isBuying }: BuyTicketModalProps) {
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
          <Button variant="default" onClick={onConfirm} disabled={isBuying}>
            {isBuying ? "Memproses..." : "Beli Sekarang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
