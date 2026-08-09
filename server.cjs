const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "ZippyGo payment backend",
    gateway: "PayFlow",
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, gateway: "PayFlow" });
});

/**
 * Creates a PayFlow hosted checkout.
 *
 * Required server-side environment variables:
 * PAYFLOW_API_URL=https://payflow-com.onrender.com/api/v1
 * PAYFLOW_API_KEY=pf_test_... or pf_live_...
 * ZIPPYGO_RETURN_URL=https://zippygotransfers.onrender.com/
 */
app.post("/api/create-payflow-checkout", async (req, res) => {
  try {
    const apiUrl = (process.env.PAYFLOW_API_URL || "").trim().replace(/\/+$/, "");
    const apiKey = (process.env.PAYFLOW_API_KEY || "").trim();
    const defaultReturnUrl =
      (process.env.ZIPPYGO_RETURN_URL ||
        "https://zippygotransfers.onrender.com/")
        .trim();

    if (!apiUrl || !apiKey) {
      return res.status(500).json({
        error:
          "PayFlow is not configured. Set PAYFLOW_API_URL and PAYFLOW_API_KEY on the backend.",
      });
    }

    const amount = Math.round(Number(req.body?.amount) * 100) / 100;
    const currency = String(req.body?.currency || "USD").toUpperCase();
    const bookingRef = String(req.body?.bookingRef || "").trim();
    const customer = req.body?.customer || {};

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount." });
    }

    if (!bookingRef) {
      return res.status(400).json({ error: "Booking reference is required." });
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ error: "Invalid currency." });
    }

    const returnUrl =
      `${defaultReturnUrl.replace(/\/+$/, "")}/?payment_status=success&booking_ref=${encodeURIComponent(bookingRef)}`;

    const payload = {
      amount,
      currency,
      title:
        String(req.body?.title || "ZippyGo Booking").slice(0, 100),
      description:
        String(req.body?.description || `ZippyGo booking ${bookingRef}`).slice(
          0,
          500
        ),
      customer: {
        name: String(customer.name || "Guest").slice(0, 120),
        email: String(customer.email || "").slice(0, 200),
        phone: String(customer.phone || "").replace(/\D/g, "").slice(-15),
      },
      max_uses: 1,
      payment_methods: ["card", "bank_transfer", "wallet", "upi", "paypal"],
      return_url: returnUrl,
    };

    const response = await axios.post(
      `${apiUrl}/payment-links`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 20000,
        validateStatus: () => true,
      }
    );

    const data = response.data || {};

    if (response.status < 200 || response.status >= 300) {
      const providerMessage =
        data?.error?.message ||
        data?.error ||
        data?.message ||
        `PayFlow returned HTTP ${response.status}.`;
      return res.status(502).json({
        error: String(providerMessage),
        provider_status: response.status,
      });
    }

    // Accept the common hosted-checkout response names used by PayFlow
    // deployments. The browser must never receive the API key.
    const checkoutUrl =
      data.checkout_url ||
      data.url ||
      data.hosted_checkout_url ||
      data.checkoutUrl ||
      data.payment_url;

    if (!checkoutUrl) {
      return res.status(502).json({
        error: "PayFlow did not return a checkout URL.",
        provider_status: response.status,
      });
    }

    return res.json({
      success: true,
      gateway: "payflow",
      bookingRef,
      checkout_url: checkoutUrl,
      link_id: data.link_id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (err) {
    const status = err.response?.status || 500;
    const details = err.response?.data;

    console.error(
      "PayFlow checkout error:",
      status,
      typeof details === "string" ? details : JSON.stringify(details || err.message)
    );

    return res.status(status).json({
      error:
        details?.error ||
        details?.message ||
        err.message ||
        "Unable to create PayFlow checkout.",
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ZippyGo PayFlow backend listening on ${PORT}`);
});
