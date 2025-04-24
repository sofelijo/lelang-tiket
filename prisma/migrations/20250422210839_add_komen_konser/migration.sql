/*
  Warnings:

  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Comment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_ticketId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pkey",
ADD COLUMN     "konserId" INTEGER,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "ticketId" DROP NOT NULL,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_konserId_fkey" FOREIGN KEY ("konserId") REFERENCES "Konser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
