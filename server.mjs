import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

const supabaseUrl = String(process.env.SUPABASE_URL || "").trim();
const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const publicUrl = String(process.env.PAYFLOW_PUBLIC_URL || "https://payflow-com.onrender.com").trim().replace(/\/+$/, "");
const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "HUF", "ISK", "CLP", "COP", "IDR"]);

function toMinorUnit(amount, currency) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return NaN;
  return Math.round(numeric * (ZERO_DECIMAL.has(currency) ? 1 : 100));
}

function hashApiKey(rawKey) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

function generateLinkId() {
  return `pl_${crypto.randomBytes(12).toString("hex")}`;
}

function getBearerToken(req) {
  const header = String(req.headers.authorization || "");
  if (!header.toLowerCase().startsWith("bearer ")) return "";
  return header.slice(7).trim();
}

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "PayFlow", api: "/api/v1/payment-links" });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "PayFlow" });
});

/**
 * Public merchant API used by ZippyGo and other integrations.
 * Creates the database payment-link record and returns the hosted checkout URL.
 */
app.post("/api/v1/payment-links", async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: "PayFlow server is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      });
    }

    const rawApiKey = getBearerToken(req);
    if (!rawApiKey || !/^pf_(test|live)_/.test(rawApiKey)) {
      return res.status(401).json({ error: "A valid PayFlow API key is required." });
    }

    const keyHash = hashApiKey(rawApiKey);
    const { data: apiKey, error: keyError } = await supabaseAdmin
      .from("api_keys")
      .select("id, merchant_id, user_id, environment, status, expires_at")
      .eq("key_hash", keyHash)
      .eq("status", "active")
      .maybeSingle();

    if (keyError) {
      console.error("PayFlow API key lookup failed:", keyError);
      return res.status(500).json({ error: "Unable to validate API key." });
    }

    if (!apiKey) return res.status(401).json({ error: "Invalid or revoked PayFlow API key." });
    if (apiKey.expires_at && new Date(apiKey.expires_at) <= new Date()) {
      return res.status(401).json({ error: "PayFlow API key has expired." });
    }

    const expectedEnvironment = rawApiKey.startsWith("pf_live_") ? "live" : "test";
    if (apiKey.environment !== expectedEnvironment) {
      return res.status(401).json({ error: "API key environment mismatch." });
    }

    const currency = String(req.body?.currency || "USD").trim().toUpperCase();
    const amount = Number(req.body?.amount);
    const minorAmount = toMinorUnit(amount, currency);
    const title = String(req.body?.title || "PayFlow Payment").trim().slice(0, 100);
    const description = String(req.body?.description || "").trim().slice(0, 500) || null;
    const maxUses = Math.max(0, Number.parseInt(String(req.body?.max_uses ?? 1), 10) || 1);
    const paymentMethods = Array.isArray(req.body?.payment_methods) && req.body.payment_methods.length
      ? req.body.payment_methods.map(String)
      : ["card"];
    const returnUrl = req.body?.return_url ? String(req.body.return_url).trim().slice(0, 2000) : null;

    if (!Number.isInteger(minorAmount) || minorAmount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number." });
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ error: "Invalid currency." });
    }
    if (!title) return res.status(400).json({ error: "Payment title is required." });

    const linkId = generateLinkId();
    const insertPayload = {
      merchant_id: apiKey.merchant_id,
      user_id: apiKey.user_id,
      link_id: linkId,
      amount: minorAmount,
      currency,
      title,
      description,
      status: "active",
      payment_methods: paymentMethods,
      max_uses: maxUses,
      use_count: 0,
      expires_at: null,
      return_url: returnUrl,
    };

    const { data: link, error: insertError } = await supabaseAdmin
      .from("payment_links")
      .insert(insertPayload)
      .select("id, link_id, amount, currency, title, status, return_url")
      .single();

    if (insertError) {
      console.error("PayFlow payment-link insert failed:", insertError);
      return res.status(500).json({ error: "Unable to create payment link." });
    }

    await supabaseAdmin
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", apiKey.id);

    const checkoutUrl = `${publicUrl}/checkout/${encodeURIComponent(link.link_id)}`;

    return res.status(201).json({
      success: true,
      link_id: link.link_id,
      checkout_url: checkoutUrl,
      amount: amount,
      currency: link.currency,
    });
  } catch (error) {
    console.error("PayFlow payment-link API error:", error);
    return res.status(500).json({ error: "Unable to create PayFlow payment link." });
  }
});

// Optional compatibility endpoint for local/internal callers.
app.post("/api/create-payflow-checkout", async (req, res) => {
  const internalApiKey = process.env.PAYFLOW_INTERNAL_API_KEY || "";
  if (!internalApiKey) return res.status(404).json({ error: "Not found." });
  const provided = getBearerToken(req);
  if (provided !== internalApiKey) return res.status(401).json({ error: "Unauthorized." });
  req.url = "/api/v1/payment-links";
  req.originalUrl = req.url;
  return res.status(404).json({ error: "Use /api/v1/payment-links." });
});

// Serve the Vite production build from the same Render service.
const distDir = path.join(__dirname, "dist");
app.use(express.static(distDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distDir, "index.html"), (err) => {
    if (err) next(err);
  });
});

const PORT = Number(process.env.PORT || 10000);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`PayFlow server listening on ${PORT}`);
});
