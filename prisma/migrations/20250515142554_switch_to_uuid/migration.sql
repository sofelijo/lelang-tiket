-- STEP 0: Pastikan pgcrypto aktif
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- STEP 1: Tambah kolom sementara UUID ke User dan Pembayaran
ALTER TABLE "User" ADD COLUMN "new_id" TEXT;
ALTER TABLE "Pembayaran" ADD COLUMN "new_id" TEXT;

-- STEP 2: Generate UUID untuk data lama
UPDATE "User" SET "new_id" = gen_random_uuid()::text;
UPDATE "Pembayaran" SET "new_id" = gen_random_uuid()::text;

-- STEP 3: Tambah kolom sementara ke semua tabel relasi
ALTER TABLE "OtpLogin" ADD COLUMN "new_userId" TEXT;
ALTER TABLE "Bid" ADD COLUMN "new_userId" TEXT;
ALTER TABLE "Comment" ADD COLUMN "new_userId" TEXT;
ALTER TABLE "Ticket" ADD COLUMN "new_userId" TEXT, ADD COLUMN "new_pemenangId" TEXT;
ALTER TABLE "Pembayaran" ADD COLUMN "new_buyerId" TEXT;
ALTER TABLE "Notifikasi" ADD COLUMN "new_userId" TEXT;
ALTER TABLE "Aktivitas" ADD COLUMN "new_userId" TEXT;
ALTER TABLE "RequestKonser" ADD COLUMN "new_userId" TEXT;
ALTER TABLE "RequestKonserLike" ADD COLUMN "new_userId" TEXT;

-- STEP 4: Isi kolom relasi dengan UUID baru
UPDATE "OtpLogin" SET "new_userId" = u."new_id"
FROM "User" u
WHERE "OtpLogin"."userId" = u."id";

UPDATE "Bid" SET "new_userId" = u."new_id"
FROM "User" u
WHERE "Bid"."userId" = u."id";

UPDATE "Comment" SET "new_userId" = u."new_id"
FROM "User" u
WHERE "Comment"."userId" = u."id";

-- FIXED: Split jadi 2 query aman
UPDATE "Ticket"
SET "new_userId" = u."new_id"
FROM "User" u
WHERE "Ticket"."userId" = u."id";

UPDATE "Ticket"
SET "new_pemenangId" = u."new_id"
FROM "User" u
WHERE "Ticket"."pemenangId" = u."id";

UPDATE "Pembayaran" SET "new_buyerId" = u."new_id"
FROM "User" u
WHERE "Pembayaran"."buyerId" = u."id";

UPDATE "Notifikasi" SET "new_userId" = u."new_id"
FROM "User" u
WHERE "Notifikasi"."userId" = u."id";

UPDATE "Aktivitas" SET "new_userId" = u."new_id"
FROM "User" u
WHERE "Aktivitas"."userId" = u."id";

UPDATE "RequestKonser" SET "new_userId" = u."new_id"
FROM "User" u
WHERE "RequestKonser"."userId" = u."id";

UPDATE "RequestKonserLike" SET "new_userId" = u."new_id"
FROM "User" u
WHERE "RequestKonserLike"."userId" = u."id";

-- STEP 5: Drop semua foreign key constraint yang akan diganti
ALTER TABLE "OtpLogin" DROP CONSTRAINT IF EXISTS "OtpLogin_userId_fkey";
ALTER TABLE "Ticket" DROP CONSTRAINT IF EXISTS "Ticket_userId_fkey";
ALTER TABLE "Ticket" DROP CONSTRAINT IF EXISTS "Ticket_pemenangId_fkey";
ALTER TABLE "Bid" DROP CONSTRAINT IF EXISTS "Bid_userId_fkey";
ALTER TABLE "Pembayaran" DROP CONSTRAINT IF EXISTS "Pembayaran_buyerId_fkey";
ALTER TABLE "Comment" DROP CONSTRAINT IF EXISTS "Comment_userId_fkey";
ALTER TABLE "Notifikasi" DROP CONSTRAINT IF EXISTS "Notifikasi_userId_fkey";
ALTER TABLE "Aktivitas" DROP CONSTRAINT IF EXISTS "Aktivitas_userId_fkey";
ALTER TABLE "RequestKonser" DROP CONSTRAINT IF EXISTS "RequestKonser_userId_fkey";
ALTER TABLE "RequestKonserLike" DROP CONSTRAINT IF EXISTS "RequestKonserLike_userId_fkey";

-- STEP 6: Drop kolom lama ID
ALTER TABLE "Pembayaran" DROP CONSTRAINT "Pembayaran_pkey";
ALTER TABLE "User" DROP CONSTRAINT "User_pkey";

ALTER TABLE "Pembayaran" DROP COLUMN "id";
ALTER TABLE "User" DROP COLUMN "id";

ALTER TABLE "OtpLogin" DROP COLUMN "userId";
ALTER TABLE "Bid" DROP COLUMN "userId";
ALTER TABLE "Comment" DROP COLUMN "userId";
ALTER TABLE "Ticket" DROP COLUMN "userId", DROP COLUMN "pemenangId";
ALTER TABLE "Pembayaran" DROP COLUMN "buyerId";
ALTER TABLE "Notifikasi" DROP COLUMN "userId";
ALTER TABLE "Aktivitas" DROP COLUMN "userId";
ALTER TABLE "RequestKonser" DROP COLUMN "userId";
ALTER TABLE "RequestKonserLike" DROP COLUMN "userId";

-- STEP 7: Rename kolom baru jadi nama lama
ALTER TABLE "Pembayaran" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "User" RENAME COLUMN "new_id" TO "id";

ALTER TABLE "OtpLogin" RENAME COLUMN "new_userId" TO "userId";
ALTER TABLE "Bid" RENAME COLUMN "new_userId" TO "userId";
ALTER TABLE "Comment" RENAME COLUMN "new_userId" TO "userId";
ALTER TABLE "Ticket" RENAME COLUMN "new_userId" TO "userId";
ALTER TABLE "Ticket" RENAME COLUMN "new_pemenangId" TO "pemenangId";
ALTER TABLE "Pembayaran" RENAME COLUMN "new_buyerId" TO "buyerId";
ALTER TABLE "Notifikasi" RENAME COLUMN "new_userId" TO "userId";
ALTER TABLE "Aktivitas" RENAME COLUMN "new_userId" TO "userId";
ALTER TABLE "RequestKonser" RENAME COLUMN "new_userId" TO "userId";
ALTER TABLE "RequestKonserLike" RENAME COLUMN "new_userId" TO "userId";

-- STEP 8: Tambahkan PK dan FK ulang
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_pkey" PRIMARY KEY ("id");

ALTER TABLE "OtpLogin" ADD CONSTRAINT "OtpLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_pemenangId_fkey" FOREIGN KEY ("pemenangId") REFERENCES "User"("id");
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "Pembayaran" ADD CONSTRAINT "Pembayaran_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id");
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "Notifikasi" ADD CONSTRAINT "Notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "Aktivitas" ADD CONSTRAINT "Aktivitas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "RequestKonser" ADD CONSTRAINT "RequestKonser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
ALTER TABLE "RequestKonserLike" ADD CONSTRAINT "RequestKonserLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id");
