
// 📁 src/lib/whatsapp.ts

import axios from "axios";

const WABLAS_URL = "https://bdg.wablas.com/api/v2/send-message";

export async function sendOtpToWhatsapp(phone: string, code: string) {
  const message = `Kode OTP kamu untuk verifikasi akun YUKNAWAR: ${code}\nBerlaku selama 5 menit. Jangan kasih ke siapa-siapa ya! 🔒`;

  const payload = {
    data: [
      {
        phone,
        message,
      },
    ],
  };

  try {
    const res = await axios.post(WABLAS_URL, payload, {
      headers: {
        Authorization: process.env.WABLAS_TOKEN!,
        "Content-Type": "application/json",
      },
    });

    if (!res.data.status) {
      console.error("❌ Gagal kirim OTP ke Wablas:", res.data);
      throw new Error("Gagal kirim OTP");
    }

    console.log("✅ OTP dikirim via Wablas");
  } catch (err) {
    console.error("❌ Error kirim OTP via Wablas:", err);
    throw err;
  }
}
