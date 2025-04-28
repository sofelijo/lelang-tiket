-- Dummy User
INSERT INTO "User" (id, name, email, password, "phoneNumber", username, "isVerified", "createdAt", "updatedAt") VALUES
(1, 'Fajar S', 'fajarsaa@gmail.com', 'tes', '08123456789', 'fajars', true, '2024-04-01 10:00:00', '2024-04-01 12:00:00');



-- Dummy Kategori
INSERT INTO "Kategori" (id, nama) VALUES
(1, 'Kategori A'),
(2, 'Kategori B'),
(3, 'Kategori C'),
(4, 'Festival'),
(5, 'VIP'),
(6, 'VVIP'),
(7, 'Tribun'),
(8, 'Economy'),
(9, 'Regular'),
(10, 'Standing');

INSERT INTO "Konser" (id, nama, lokasi, venue, tanggal) 
VALUES
  (1, 'Konser Musim Panas', 'Jakarta', 'Gelora Bung Karno', '2025-06-15'),
  (2, 'Festival Musik Jakarta', 'Jakarta', 'Jakarta International Stadium', '2025-07-20'),
  (3, 'Bali Music Fest', 'Bali', 'Garuda Wisnu Kencana', '2025-08-10'),
  (4, 'ICE Music Expo', 'Tangerang', 'Indonesia Convention Exhibition', '2025-09-05'),
  (5, 'Surabaya Sound Fest', 'Surabaya', 'Stadion Gelora Bung Tomo', '2025-10-12'),
  (6, 'Samarinda Rock Night', 'Samarinda', 'Stadion Utama Palaran', '2025-11-18'),
  (7, 'Pekanbaru Jazz Festival', 'Pekanbaru', 'Stadion Utama Riau', '2025-12-03'),
  (8, 'Jayapura Cultural Concert', 'Jayapura', 'Stadion Papua Bangkit', '2026-01-22'),
  (9, 'Aceh Harmony Night', 'Banda Aceh', 'Stadion Harapan Bangsa', '2026-02-14'),
  (10, 'Bandung Indie Fest', 'Bandung', 'Stadion Gelora Bandung Lautan Api', '2026-03-30');

INSERT INTO "KonserKategori" (id, "konserId", "kategoriId") VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 4),
(4, 2, 5),
(5, 3, 3),
(6, 3, 6),
(7, 4, 4),
(8, 5, 8),
(9, 6, 10),
(10, 7, 7),
(11, 8, 9),
(12, 9, 4),
(13, 9, 10),
(14, 10, 1),
(15, 10, 5);


-- Dummy Ticket Lengkap
INSERT INTO "Ticket" (id, seat, "tipeTempat", harga_awal, harga_beli, kelipatan, batas_waktu, deskripsi, perpanjangan_bid, "userId", "konserId", "kategoriId", jumlah, "statusLelang", "createdAt", "updatedAt") VALUES
(1, 'A1', 'Duduk', 500000, 3500000, 10000, '2025-06-05 23:59:00', 'Tiket duduk di kursi A1', 'SATU_HARI', 1, 1, 1, 2, 'BERLANGSUNG', '2024-03-10 10:00:00', '2024-04-20 10:00:00'),
(2, 'A2', 'Duduk', 500000, 4000000, 5000, '2025-06-05 23:59:00', 'Tiket duduk di kursi A2', 'DUA_HARI', 1, 1, 1, 1, 'BERLANGSUNG', '2024-01-15 09:00:00', '2024-03-30 08:00:00'),
(3, 'B1', 'Duduk', 450000, 1500000, 7000, '2025-06-05 23:59:00', 'Tiket duduk di kursi B1', 'TANPA', 1, 1, 2, 3, 'BERLANGSUNG', '2024-02-05 12:00:00', '2024-04-25 11:00:00'),
(4, 'RANDOM', 'Berdiri', 300000, 1000000, 3000, '2025-07-10 23:59:00', 'Tiket berdiri area RANDOM', 'DUA_HARI', 1, 2, 4, 5, 'BERLANGSUNG', '2024-03-01 11:00:00', '2024-04-10 11:30:00'),
(5, 'RANDOM', 'Berdiri', 300000, 1200000, 2000, '2025-07-10 23:59:00', 'Tiket berdiri area RANDOM', 'SATU_HARI', 1, 2, 4, 4, 'BERLANGSUNG', '2024-01-20 15:00:00', '2024-04-15 13:00:00'),
(6, 'VIP1', 'Duduk', 1000000, 9000000, 10000, '2025-07-10 23:59:00', 'Tiket duduk di kursi VIP1', 'TANPA', 1, 2, 5, 2, 'BERLANGSUNG', '2024-02-10 08:00:00', '2024-04-01 07:00:00'),
(7, 'J1', 'Duduk', 400000, 2500000, 6000, '2025-08-15 23:59:00', 'Tiket duduk di kursi J1', 'SATU_HARI', 1, 3, 3, 2, 'BERLANGSUNG', '2024-03-05 09:30:00', '2024-04-25 12:30:00'),
(8, 'J2', 'Duduk', 400000, 2600000, 5000, '2025-08-15 23:59:00', 'Tiket duduk di kursi J2', 'DUA_HARI', 1, 3, 3, 2, 'BERLANGSUNG', '2024-02-01 10:30:00', '2024-03-28 11:30:00'),
(9, 'VVIP1', 'Duduk', 1500000, 10000000, 15000, '2025-08-15 23:59:00', 'Tiket duduk di kursi VVIP1', 'TANPA', 1, 3, 6, 1, 'BERLANGSUNG', '2024-03-20 07:00:00', '2024-04-18 06:30:00'),
(10, 'RANDOM', 'Berdiri', 350000, 1500000, 4000, '2025-09-01 23:59:00', 'Tiket berdiri area RANDOM', 'SATU_HARI', 1, 4, 4, 3, 'BERLANGSUNG', '2024-01-25 14:00:00', '2024-03-20 15:00:00'),
(11, 'RANDOM', 'Berdiri', 350000, 1700000, 4000, '2025-09-01 23:59:00', 'Tiket berdiri area RANDOM', 'DUA_HARI', 1, 4, 4, 2, 'BERLANGSUNG', '2024-02-10 13:00:00', '2024-04-20 14:00:00'),
(12, 'G1', 'Duduk', 250000, 900000, 3000, '2025-06-20 23:59:00', 'Tiket duduk di kursi G1', 'SATU_HARI', 1, 5, 8, 2, 'BERLANGSUNG', '2024-01-18 10:00:00', '2024-04-05 10:30:00'),
(13, 'G2', 'Duduk', 250000, 950000, 4000, '2025-06-20 23:59:00', 'Tiket duduk di kursi G2', 'TANPA', 1, 5, 8, 2, 'BERLANGSUNG', '2024-02-12 11:00:00', '2024-04-15 11:30:00'),
(14, 'RANDOM', 'Berdiri', 200000, 750000, 2000, '2025-10-05 23:59:00', 'Tiket berdiri area RANDOM', 'SATU_HARI', 1, 6, 10, 3, 'BERLANGSUNG', '2024-03-02 09:00:00', '2024-04-21 09:30:00'),
(15, 'RANDOM', 'Berdiri', 200000, 800000, 2500, '2025-10-05 23:59:00', 'Tiket berdiri area RANDOM', 'DUA_HARI', 1, 6, 10, 2, 'BERLANGSUNG', '2024-02-22 15:00:00', '2024-04-10 16:00:00'),
(16, 'TR1', 'Duduk', 180000, 650000, 2000, '2025-11-05 23:59:00', 'Tiket duduk di kursi TR1', 'TANPA', 1, 7, 7, 2, 'BERLANGSUNG', '2024-01-10 10:00:00', '2024-04-01 11:00:00'),
(17, 'TR2', 'Duduk', 180000, 700000, 2500, '2025-11-05 23:59:00', 'Tiket duduk di kursi TR2', 'SATU_HARI', 1, 7, 7, 2, 'BERLANGSUNG', '2024-01-25 14:00:00', '2024-03-15 15:00:00'),
(18, 'B1', 'Duduk', 300000, 1000000, 4000, '2025-11-28 23:59:00', 'Tiket duduk di kursi B1', 'TANPA', 1, 8, 9, 3, 'BERLANGSUNG', '2024-02-18 08:00:00', '2024-04-22 09:00:00'),
(19, 'B2', 'Duduk', 300000, 1050000, 4000, '2025-11-28 23:59:00', 'Tiket duduk di kursi B2', 'SATU_HARI', 1, 8, 9, 2, 'BERLANGSUNG', '2024-03-12 10:30:00', '2024-04-24 11:30:00'),
(20, 'RANDOM', 'Berdiri', 350000, 1700000, 5000, '2025-07-28 23:59:00', 'Tiket berdiri area RANDOM', 'DUA_HARI', 1, 9, 4, 3, 'BERLANGSUNG', '2024-01-30 09:00:00', '2024-03-25 10:00:00'),
(21, 'RANDOM', 'Berdiri', 350000, 1800000, 5000, '2025-07-28 23:59:00', 'Tiket berdiri area RANDOM', 'SATU_HARI', 1, 9, 4, 2, 'BERLANGSUNG', '2024-02-08 07:00:00', '2024-04-08 08:00:00'),
(22, 'RANDOM', 'Berdiri', 400000, 2200000, 6000, '2025-07-28 23:59:00', 'Tiket berdiri area RANDOM', 'DUA_HARI', 1, 9, 10, 2, 'BERLANGSUNG', '2024-03-05 13:00:00', '2024-04-15 13:30:00'),
(23, 'RANDOM', 'Berdiri', 400000, 2300000, 6000, '2025-07-28 23:59:00', 'Tiket berdiri area RANDOM', 'TANPA', 1, 9, 10, 2, 'BERLANGSUNG', '2024-02-18 14:00:00', '2024-04-22 15:00:00'),
(24, 'A3', 'Duduk', 600000, 4500000, 7000, '2025-09-15 23:59:00', 'Tiket duduk di kursi A3', 'SATU_HARI', 1, 10, 1, 2, 'BERLANGSUNG', '2024-01-20 09:00:00', '2024-03-20 10:00:00'),
(25, 'VIP2', 'Duduk', 1200000, 9000000, 15000, '2025-09-15 23:59:00', 'Tiket duduk di kursi VIP2', 'DUA_HARI', 1, 10, 5, 1, 'BERLANGSUNG', '2024-02-15 07:30:00', '2024-04-12 08:00:00'),
(26, 'VIP3', 'Duduk', 1200000, 9100000, 15000, '2025-09-15 23:59:00', 'Tiket duduk di kursi VIP3', 'SATU_HARI', 1, 10, 5, 1, 'BERLANGSUNG', '2024-03-01 09:00:00', '2024-04-20 09:30:00'),
(27, 'A4', 'Duduk', 600000, 4600000, 7000, '2025-09-15 23:59:00', 'Tiket duduk di kursi A4', 'TANPA', 1, 10, 1, 2, 'BERLANGSUNG', '2024-02-01 12:00:00', '2024-03-25 12:30:00'),
(28, 'A5', 'Duduk', 600000, 4700000, 7000, '2025-09-15 23:59:00', 'Tiket duduk di kursi A5', 'DUA_HARI', 1, 10, 1, 2, 'BERLANGSUNG', '2024-02-20 10:00:00', '2024-04-10 11:00:00'),
(29, 'RANDOM', 'Berdiri', 300000, 1200000, 3000, '2025-09-01 23:59:00', 'Tiket berdiri area RANDOM', 'SATU_HARI', 1, 4, 4, 3, 'BERLANGSUNG', '2024-01-25 08:30:00', '2024-04-01 09:30:00'),
(30, 'RANDOM', 'Berdiri', 300000, 1250000, 3000, '2025-09-01 23:59:00', 'Tiket berdiri area RANDOM', 'DUA_HARI', 1, 4, 4, 3, 'BERLANGSUNG', '2024-02-10 07:00:00', '2024-04-10 08:00:00');

