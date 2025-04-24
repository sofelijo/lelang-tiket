-- CreateEnum
CREATE TYPE "StatusLelang" AS ENUM ('PENDING', 'BERLANGSUNG', 'SELESAI');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "jumlah" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "statusLelang" "StatusLelang" NOT NULL DEFAULT 'BERLANGSUNG';
