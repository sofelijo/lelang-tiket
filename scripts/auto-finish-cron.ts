// scripts/auto-finish-cron.ts
import cron from "node-cron";
import fetch from "node-fetch";

cron.schedule("* * * * *", async () => {
  try {
    console.log("⏱️ Menjalankan auto-finish...");

    const res = await fetch("http://localhost:3000/api/ticket/auto-finish", {
      method: "PATCH",
    });

    const data = await res.json();
    console.log("✅ Auto-finish result:", data);
  } catch (err) {
    console.error("❌ Gagal call API:", err);
  }
});
