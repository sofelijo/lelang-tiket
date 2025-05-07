-- AlterTable
ALTER TABLE "OtpLogin" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "OtpLogin" ADD CONSTRAINT "OtpLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
