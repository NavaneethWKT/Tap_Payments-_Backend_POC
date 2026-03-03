import { Router } from "express";

const router = Router();

router.post("/tap", (req, res) => {
  try {
    console.log("[webhook/tap] received — headers:", JSON.stringify(req.headers, null, 2));
    console.log("[webhook/tap] body:", JSON.stringify(req.body, null, 2));
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).send("Invalid body");
    }
    return res.status(200).send("OK");
  } catch (err) {
    console.error("webhook/tap error:", err);
    return res.status(500).send("Error");
  }
});

export default router;
