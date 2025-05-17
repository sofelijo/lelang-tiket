import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan Yuknawar",
  description: "Ketentuan penggunaan platform Yuknawar oleh pengguna.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold">📝 Syarat & Ketentuan Yuknawar</h1>
      <p className="text-muted-foreground">
        Dengan menggunakan situs dan/atau aplikasi Yuknawar, kamu menyatakan telah membaca, memahami, dan menyetujui semua isi dari Syarat dan Ketentuan berikut ini.
      </p>

      <Separator />

      <div className="space-y-5 text-sm leading-6">
        <section>
          <h2 className="font-semibold text-base">1. Definisi</h2>
          <ul className="list-disc list-inside">
            <li><b>Yuknawar</b> adalah platform digital untuk jual beli dan lelang tiket konser, event, atau hiburan lainnya.</li>
            <li><b>Pengguna</b> adalah setiap individu yang mengakses, mendaftar, atau menggunakan layanan Yuknawar.</li>
            <li><b>Tiket</b> adalah produk digital yang memberikan akses ke suatu acara, yang diperjualbelikan di platform ini.</li>
            <li><b>Lelang</b> adalah metode penjualan terbuka di mana pengguna dapat melakukan penawaran hingga waktu tertentu.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base">2. Ketentuan Akun</h2>
          <ul className="list-disc list-inside">
            <li>Pengguna wajib mendaftar dengan informasi yang benar, valid, dan terbaru.</li>
            <li>Setiap pengguna hanya diperbolehkan memiliki satu akun aktif.</li>
            <li>Keamanan akun sepenuhnya menjadi tanggung jawab pengguna, termasuk penggunaan oleh pihak ketiga.</li>
            <li>Yuknawar berhak menonaktifkan atau menangguhkan akun yang terindikasi melanggar aturan.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base">3. Penjualan dan Lelang Tiket</h2>
          <ul className="list-disc list-inside">
            <li>Tiket yang diposting harus jelas, sesuai kategori, dan tidak menyesatkan.</li>
            <li>Penjual wajib mencantumkan deskripsi, harga awal, harga beli langsung, dan waktu berakhir lelang (jika berlaku).</li>
            <li>Penjual dilarang membatalkan lelang yang sedang berjalan tanpa alasan yang sah.</li>
            <li>Yuknawar berhak menghapus listing yang melanggar kebijakan atau merugikan pengguna lain.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base">4. Transaksi dan Pembayaran</h2>
          <ul className="list-disc list-inside">
            <li>Semua transaksi dilakukan melalui metode resmi yang disediakan oleh Yuknawar.</li>
            <li>Pembeli tertinggi pada lelang dianggap pemenang dan wajib menyelesaikan pembayaran sesuai harga akhir.</li>
            <li>Dana ditahan sementara oleh sistem (escrow) dan akan diteruskan ke penjual setelah tiket dinyatakan valid digunakan.</li>
            <li>Kegagalan menyelesaikan pembayaran dalam waktu yang ditentukan dapat berakibat pembatalan transaksi secara otomatis.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base">5. Biaya dan Pengembalian Dana</h2>
          <ul className="list-disc list-inside">
            <li>Yuknawar mengenakan biaya layanan pada setiap transaksi.</li>
            <li>Biaya ini mencakup biaya platform dan biaya metode pembayaran.</li>
            <li>Pengembalian dana hanya dilakukan dalam kasus tertentu seperti acara dibatalkan atau kesalahan sistem.</li>
            <li>Refund tidak berlaku untuk tiket yang sudah digunakan atau dinyatakan valid.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base">6. Etika dan Larangan</h2>
          <p>Pengguna dilarang melakukan hal berikut:</p>
          <ul className="list-disc list-inside">
            <li>Penipuan atau manipulasi harga</li>
            <li>Menggunakan bot, spam, atau aktivitas curang lainnya</li>
            <li>Membuat konten menyesatkan atau merugikan pihak lain</li>
            <li>Melanggar hukum yang berlaku di Indonesia</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base">7. Privasi dan Keamanan Data</h2>
          <ul className="list-disc list-inside">
            <li>Data pribadi kamu dikelola dengan aman dan hanya digunakan untuk keperluan transaksi serta peningkatan layanan.</li>
            <li>Yuknawar tidak akan membagikan data tanpa persetujuan, kecuali diwajibkan oleh hukum.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base">8. Perubahan Ketentuan</h2>
          <p>Yuknawar berhak melakukan perubahan terhadap Syarat & Ketentuan kapan saja. Perubahan akan diberitahukan melalui platform dan mulai berlaku sejak tanggal diperbarui.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">9. Hukum yang Berlaku</h2>
          <p>Semua Syarat & Ketentuan ini tunduk pada hukum Republik Indonesia. Penyelesaian sengketa akan diupayakan secara musyawarah, dan jika tidak tercapai, maka dapat diselesaikan melalui jalur hukum.</p>
        </section>

        <section>
          <h2 className="font-semibold text-base">✅ Persetujuan Pengguna</h2>
          <p>Dengan menggunakan layanan Yuknawar, kamu menyatakan telah memahami dan menyetujui seluruh Syarat & Ketentuan di atas.</p>
        </section>

        <p className="text-xs text-muted-foreground mt-8">
          Yuk lelang dengan aman, jujur, dan penuh semangat 🎉  
          <br />Versi terakhir diperbarui: <strong>17 Mei 2025</strong>
        </p>
      </div>
    </div>
  );
}
