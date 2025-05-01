-- AlterEnum
ALTER TYPE "MetodePembayaran" ADD VALUE 'MIDTRANS';

-- AlterTable
ALTER TABLE "Pembayaran" ADD COLUMN     "order_id" TEXT;
