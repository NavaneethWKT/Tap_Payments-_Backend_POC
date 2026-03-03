import { Router } from "express";
import crypto from "crypto";
import { config } from "../config.js";
import { generateHashString, getTapConfig } from "../tap.js";

const router = Router();

router.get("/prepare/:customerId", (req, res) => {
  try {
    const baseUrl = config.server.baseUrl;
    if (!baseUrl.startsWith("https://") || baseUrl.includes("localhost")) {
      return res.status(400).json({
        error:
          "BASE_URL must be a public HTTPS URL (e.g. ngrok). Tap returns INVALID_CONFIGURATION for localhost.",
        code: "BASE_URL_MUST_BE_HTTPS",
        hint: "In TapPoCBackend/.env set BASE_URL=https://YOUR_NGROK_URL (run: ngrok http 3000, then copy the https URL)",
      });
    }

    const customerId = req.params.customerId;
    if (!customerId) {
      return res.status(400).json({ error: "Missing customerId in path" });
    }

    const amt = 5;
    const curr = "SAR";
    const orderReference = `ord_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const transactionReference = `txn_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const postUrl = `${baseUrl}/webhook/tap`;

    const formattedAmount = Number(amt).toFixed(2);
    const hashString = generateHashString({
      amount: amt,
      currency: curr,
      transactionReference,
      postUrl,
    });

    return res.json({
      hashString,
      transactionReference,
      orderReference,
      postUrl,
      formattedAmount,
      currency: curr,
      gateway: getTapConfig(),
    });
  } catch (err) {
    console.error("checkout/prepare error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
});

export default router;
