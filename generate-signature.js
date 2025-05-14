const crypto = require("crypto");

const rawBody = '{"order_id":"LL-1-1747235793746-6302","transaction_status":"settlement","status_code":"200","gross_amount":"228337"}';
const serverKey = "SB-Mid-server-vWTVbRQBDPBPKpUVgbuBoKKs";

const signature = crypto
  .createHmac("sha512", serverKey)
  .update(rawBody)
  .digest("hex");

console.log("✅ Signature:", signature);
