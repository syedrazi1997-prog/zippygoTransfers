const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(express.json({ limit: "1mb" }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: false,
  })
);

app.options("*", cors());

function env(name, fallback = "") {
  return String(process.env[name] ?? fallback).trim();
}

function appwriteConfig() {
  return {
    endpoint: env("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1").replace(/\/+$/, ""),
    projectId: env("APPWRITE_PROJECT_ID"),
    apiKey: env("APPWRITE_API_KEY"),
    databaseId: env("APPWRITE_DATABASE_ID"),
    collectionId: env("APPWRITE_BOOKINGS_COLLECTION_ID", "bookings"),
  };
}

function requireAppwriteConfig() {
  const config = appwriteConfig();
  const missing = [];

  if (!config.projectId) missing.push("APPWRITE_PROJECT_ID");
  if (!config.apiKey) missing.push("APPWRITE_API_KEY");
  if (!config.databaseId) missing.push("APPWRITE_DATABASE_ID");
  if (!config.collectionId) missing.push("APPWRITE_BOOKINGS_COLLECTION_ID");

  if (missing.length) {
    const error = new Error(`Appwrite is not configured. Missing: ${missing.join(", ")}`);
    error.statusCode = 500;
    throw error;
  }

  return config;
}

function appwriteHeaders(config) {
  return {
    "X-Appwrite-Project": config.projectId,
    "X-Appwrite-Key": config.apiKey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function appwriteRequest(method, path, config, data, params) {
  return axios({
    method,
    url: `${config.endpoint}${path}`,
    headers: appwriteHeaders(config),
    data,
    params,
    timeout: 15000,
    validateStatus: () => true,
  });
}

function appwriteErrorMessage(response) {
  const data = response?.data || {};
  return (
    data.message ||
    data.error ||
    `Appwrite returned HTTP ${response?.status ?? "unknown"}.`
  );
}

async function createBookingDocument(booking) {
  const config = requireAppwriteConfig();

  // Booking references contain only letters, numbers and hyphens, so they are
  // safe Appwrite document IDs and make lookup deterministic.
  const documentId = booking.bookingRef;

  const response = await appwriteRequest(
    "POST",
    `/databases/${encodeURIComponent(config.databaseId)}/collections/${encodeURIComponent(
      config.collectionId
    )}/documents`,
    config,
    {
      documentId,
      data: booking.data,
    }
  );

  if (response.status < 200 || response.status >= 300) {
    const error = new Error(appwriteErrorMessage(response));
    error.statusCode = response.status === 409 ? 409 : 502;
    error.providerStatus = response.status;
    throw error;
  }

  return response.data;
}

async function getBookingDocument(bookingRef) {
  const config = requireAppwriteConfig();

  const response = await appwriteRequest(
    "GET",
    `/databases/${encodeURIComponent(config.databaseId)}/collections/${encodeURIComponent(
      config.collectionId
    )}/documents/${encodeURIComponent(bookingRef)}`,
    config
  );

  if (response.status < 200 || response.status >= 300) {
    const error = new Error(appwriteErrorMessage(response));
    error.statusCode = response.status === 404 ? 404 : 502;
    error.providerStatus = response.status;
    throw error;
  }

  return response.data;
}

async function updateBookingDocument(bookingRef, data) {
  const config = requireAppwriteConfig();

  const response = await appwriteRequest(
    "PATCH",
    `/databases/${encodeURIComponent(config.databaseId)}/collections/${encodeURIComponent(
      config.collectionId
    )}/documents/${encodeURIComponent(bookingRef)}`,
    config,
    { data }
  );

  if (response.status < 200 || response.status >= 300) {
    const error = new Error(appwriteErrorMessage(response));
    error.statusCode = 502;
    error.providerStatus = response.status;
    throw error;
  }

  return response.data;
}

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "ZippyGo payment backend",
    gateway: "PayFlow",
  });
});

app.get("/health", (_req, res) => {
  const payflowConfigured = Boolean(env("PAYFLOW_API_URL") && env("PAYFLOW_API_KEY"));
  const aw = appwriteConfig();
  const appwriteConfigured = Boolean(
    aw.projectId && aw.apiKey && aw.databaseId && aw.collectionId
  );

  res.json({
    ok: true,
    gateway: "PayFlow",
    payflow_configured: payflowConfigured,
    appwrite_configured: appwriteConfigured,
  });
});

app.get("/api/appwrite/status", async (_req, res) => {
  try {
    const config = requireAppwriteConfig();

    const response = await appwriteRequest(
      "GET",
      `/databases/${encodeURIComponent(config.databaseId)}/collections/${encodeURIComponent(
        config.collectionId
      )}`,
      config
    );

    if (response.status < 200 || response.status >= 300) {
      return res.status(502).json({
        ok: false,
        error: appwriteErrorMessage(response),
        provider_status: response.status,
      });
    }

    return res.json({
      ok: true,
      database_id: config.databaseId,
      collection_id: config.collectionId,
      collection_name: response.data?.name || null,
    });
  } catch (error) {
    console.error("Appwrite status error:", error.message);
    return res.status(error.statusCode || 500).json({
      ok: false,
      error: error.message || "Unable to connect to Appwrite.",
    });
  }
});

/**
 * Creates the Appwrite pending booking and PayFlow hosted checkout in one
 * server-side flow. The browser never needs Appwrite credentials or direct
 * access to the Appwrite API.
 */
app.post("/api/create-payflow-checkout", async (req, res) => {
  let bookingRef = "";

  try {
    const apiUrl = env("PAYFLOW_API_URL").replace(/\/+$/, "");
    const apiKey = env("PAYFLOW_API_KEY");
    const defaultReturnUrl = env(
      "ZIPPYGO_RETURN_URL",
      "https://zippygotransfers.onrender.com/"
    );

    if (!apiUrl || !apiKey) {
      return res.status(500).json({
        error:
          "PayFlow is not configured. Set PAYFLOW_API_URL and PAYFLOW_API_KEY on the backend.",
      });
    }

    const body = req.body || {};
    const amount = Math.round(Number(body.amount) * 100) / 100;
    const currency = String(body.currency || "USD").toUpperCase();
    bookingRef = String(body.bookingRef || "").trim();
    const customer = body.customer || {};
    const booking = body.booking || {};

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid payment amount." });
    }

    if (!bookingRef || !/^[A-Z0-9-]{6,40}$/.test(bookingRef)) {
      return res.status(400).json({ error: "Invalid booking reference." });
    }

    if (!/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ error: "Invalid currency." });
    }

    const customerName = String(customer.name || "").trim();
    const customerEmail = String(customer.email || "").trim().toLowerCase();
    const customerPhone = String(customer.phone || "").replace(/\D/g, "").slice(-15);

    if (!customerName || !customerEmail) {
      return res.status(400).json({ error: "Customer name and email are required." });
    }

    // Store the booking before payment starts so the order exists even if the
    // hosted payment page is opened and later abandoned.
    const bookingData = {
      service_type: String(booking.service_type || "transfer"),
      pickup_location: String(booking.pickup_location || ""),
      dropoff_location: booking.dropoff_location ? String(booking.dropoff_location) : null,
      pickup_date: String(booking.pickup_date || ""),
      pickup_time: String(booking.pickup_time || ""),
      return_date: booking.return_date ? String(booking.return_date) : null,
      vehicle_id: String(booking.vehicle_id || ""),
      vehicle_name: String(booking.vehicle_name || ""),
      passengers: String(booking.passengers || "1"),
      luggage: String(booking.luggage || ""),
      customer_name: customerName,
      customer_email: customerEmail,
      amount: String(body.totalUSD ?? amount),
      currency,
      amount_in_currency: String(amount),
      customer_phone: customerPhone || null,
      flight_number: booking.flight_number ? String(booking.flight_number) : null,
      extras: typeof booking.extras === "string"
        ? booking.extras
        : JSON.stringify(booking.extras || {}),
      booking_ref: bookingRef,
      payment_status: "pending",
    };

    try {
      await createBookingDocument({ bookingRef, data: bookingData });
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          error: "This booking reference already exists. Please try again.",
        });
      }
      console.error("Appwrite booking creation error:", error.message);
      return res.status(error.statusCode || 502).json({
        error: `Unable to save booking in Appwrite: ${error.message}`,
      });
    }

    const returnUrl =
      `${defaultReturnUrl.replace(/\/+$/, "")}/?payment_status=success&booking_ref=${encodeURIComponent(
        bookingRef
      )}`;

    const payload = {
      amount,
      currency,
      title: String(body.title || "ZippyGo Booking").slice(0, 100),
      description: String(
        body.description || `ZippyGo booking ${bookingRef}`
      ).slice(0, 500),
      customer: {
        name: customerName.slice(0, 120),
        email: customerEmail.slice(0, 200),
        phone: customerPhone,
      },
      max_uses: 1,
      payment_methods: ["card", "bank_transfer", "wallet", "upi", "paypal"],
      return_url: returnUrl,
    };

    const response = await axios.post(`${apiUrl}/payment-links`, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 20000,
      validateStatus: () => true,
    });

    const rawData = response.data || {};
    const data =
      rawData?.data && typeof rawData.data === "object"
        ? { ...rawData, ...rawData.data }
        : rawData;

    if (response.status < 200 || response.status >= 300) {
      try {
        await updateBookingDocument(bookingRef, { payment_status: "failed" });
      } catch (updateError) {
        console.error("Unable to mark failed PayFlow booking:", updateError.message);
      }

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

    // Robust extraction for checkout URL / link id: check known keys AND deep-scan nested objects.
    function extractCheckoutInfo(obj) {
      const result = { checkoutUrl: null, linkId: null };

      // Known keys to check first (top-level)
      const urlKeys = [
        "checkout_url",
        "checkoutUrl",
        "hosted_checkout_url",
        "payment_url",
        "paymentUrl",
        "url",
        "redirect_url",
        "redirectUrl",
        "public_url",
        "payment_link_url",
        "paymentLinkUrl",
      ];
      const idKeys = [
        "link_id",
        "linkId",
        "payment_link_id",
        "paymentLinkId",
        "id",
        "payment_id",
        "paymentId",
      ];

      for (const k of urlKeys) {
        if (!result.checkoutUrl && obj && typeof obj[k] === "string") {
          result.checkoutUrl = obj[k];
        }
      }
      for (const k of idKeys) {
        if (!result.linkId && obj && typeof obj[k] === "string") {
          result.linkId = obj[k];
        }
      }

      // Deep scan: find first values that look like URLs or plausible IDs
      function visit(value) {
        if (!value || (result.checkoutUrl && result.linkId)) return;
        if (typeof value === "string") {
          const s = value.trim();
          if (!result.checkoutUrl && /^https?:\/\//i.test(s)) {
            // prefer URLs that include checkout/payment paths
            if (/checkout|payment|pay|hosted|payment_link|payment-link|redirect|return/i.test(s) || !result.checkoutUrl) {
              result.checkoutUrl = s;
            }
          } else if (!result.linkId && /^[A-Za-z0-9_\-]{6,}$/.test(s)) {
            // a plausible link id (alphanumeric, underscores/hyphens)
            result.linkId = s;
          } else if (!result.linkId && /^\d{6,}$/.test(s)) {
            // some providers return numeric-only IDs - accept long numeric ids
            result.linkId = s;
          }
        } else if (Array.isArray(value)) {
          for (const v of value) {
            // If array contains objects like { url, href, id }
            visit(v);
            if (result.checkoutUrl && result.linkId) return;
          }
        } else if (typeof value === "object") {
          // Common patterns: { url: '...', href: '...', link: '...' }
          const candidateUrl = value.url || value.href || value.checkout_url || value.payment_url || value.redirect_url || value.public_url;
          if (!result.checkoutUrl && typeof candidateUrl === "string") {
            visit(candidateUrl);
          }

          const candidateId = value.id || value.link_id || value.linkId || value.payment_link_id || value.paymentId || value.payment_id;
          if (!result.linkId && typeof candidateId === "string") {
            visit(candidateId);
          }

          // Also detect arrays under common container keys
          const possibleArrays = ["links", "payment_links", "paymentLinks", "items", "data", "results"];
          for (const key of possibleArrays) {
            if (value[key]) visit(value[key]);
            if (result.checkoutUrl && result.linkId) return;
          }

          for (const k of Object.keys(value)) visit(value[k]);
        }
      }

      visit(obj);
      return result;
    }

    const extracted = extractCheckoutInfo(data);

    // Header fallback: some providers return a redirect/location header instead of a body URL
    const headerUrl = (response && response.headers) ? (
      response.headers.location ||
      response.headers["content-location"] ||
      response.headers["x-checkout-url"] ||
      response.headers["x-payment-url"] ||
      response.headers["x-link-url"] ||
      null
    ) : null;

    let checkoutUrl =
      extracted.checkoutUrl ||
      data.checkout_url ||
      data.url ||
      data.hosted_checkout_url ||
      data.checkoutUrl ||
      data.payment_url ||
      headerUrl;

    const linkId =
      extracted.linkId ||
      data.link_id ||
      data.linkId ||
      data.payment_link_id ||
      data.paymentLinkId ||
      data.id;

    // Construct a public checkout URL if only a link id is present
    if (!checkoutUrl && linkId) {
      const payflowPublicUrl = env(
        "PAYFLOW_PUBLIC_URL",
        apiUrl.replace(/\/api\/v1$/i, "")
      ).replace(/\/+$/, "");

      checkoutUrl = `${payflowPublicUrl}/checkout/${encodeURIComponent(
        String(linkId)
      )}`;
    }

    if (!checkoutUrl) {
      // Log the full raw response for debugging (safe in server logs; do NOT leak to clients)
      console.error(
        "PayFlow returned HTTP 200 without checkout URL or link ID:",
        JSON.stringify(rawData, null, 2),
        "response headers:",
        JSON.stringify(response.headers || {}, null, 2)
      );

      // Try to mark the booking as failed so it doesn't remain pending indefinitely.
      try {
        await updateBookingDocument(bookingRef, { payment_status: "failed" });
      } catch (updateError) {
        console.error("Unable to mark failed PayFlow booking:", updateError.message);
      }

      return res.status(502).json({
        error:
          "PayFlow created a response but did not provide a checkout URL or payment-link ID.",
        provider_status: response.status,
      });
    }

    return res.json({
      success: true,
      gateway: "payflow",
      bookingRef,
      checkout_url: checkoutUrl,
      link_id: linkId,
      amount: data.amount ?? amount,
      currency: data.currency ?? currency,
    });
  } catch (error) {
    console.error(
      "PayFlow checkout error:",
      error.response?.status || error.statusCode || 500,
      error.response?.data || error.message
    );

    return res.status(error.statusCode || error.response?.status || 500).json({
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Unable to create PayFlow checkout.",
    });
  }
});

// Debugging endpoint: proxy a payment-links creation request to PayFlow and
// return the raw provider response. Requires X-Debug-Token header to match
// process.env.DEBUG_TOKEN. This is intended for short-lived debugging only.
app.post("/api/debug/payflow", async (req, res) => {
  try {
    const provided = String(req.header("X-Debug-Token") || "");
    const expected = String(process.env.DEBUG_TOKEN || "");

    if (!expected || provided !== expected) {
      return res.status(403).json({ error: "Forbidden. Invalid debug token." });
    }

    const apiUrl = env("PAYFLOW_API_URL").replace(/\/+$/, "");
    const apiKey = env("PAYFLOW_API_KEY");

    if (!apiUrl || !apiKey) {
      return res.status(500).json({ error: "PayFlow is not configured on the backend." });
    }

    const payload = req.body || {};

    const response = await axios.post(`${apiUrl}/payment-links`, payload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 20000,
      validateStatus: () => true,
    });

    // Return the raw provider response (status, headers, body) so it can be
    // inspected. Caller must keep this confidential.
    return res.status(200).json({
      ok: true,
      provider_status: response.status,
      provider_headers: response.headers,
      provider_data: response.data,
    });
  } catch (error) {
    console.error("PayFlow debug proxy error:", error.message, error.response?.data);
    return res.status(error.response?.status || 500).json({
      error: error.message || "Debug proxy failure",
      provider_data: error.response?.data,
    });
  }
});

app.post("/api/bookings/find", async (req, res) => {
  try {
    const bookingRef = String(req.body?.bookingRef || "").trim().toUpperCase();
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!bookingRef || !email) {
      return res.status(400).json({
        error: "Booking reference and email are required.",
      });
    }

    const booking = await getBookingDocument(bookingRef);

    if (
      String(booking?.customer_email || "").trim().toLowerCase() !== email
    ) {
      return res.status(404).json({
        error: "No booking found with this reference and email.",
      });
    }

    return res.json({ ok: true, booking });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({
        error: "No booking found with this reference and email.",
      });
    }

    console.error("Booking lookup error:", error.message);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Unable to search for booking.",
    });
  }
});

app.patch("/api/bookings/:bookingRef/cancel", async (req, res) => {
  try {
    const bookingRef = String(req.params.bookingRef || "").trim().toUpperCase();
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!bookingRef || !email) {
      return res.status(400).json({
        error: "Booking reference and email are required.",
      });
    }

    const booking = await getBookingDocument(bookingRef);

    if (
      String(booking?.customer_email || "").trim().toLowerCase() !== email
    ) {
      return res.status(404).json({ error: "Booking not found." });
    }

    if (String(booking?.payment_status || "").toLowerCase() === "cancelled") {
      return res.json({ ok: true, booking });
    }

    const updated = await updateBookingDocument(bookingRef, {
      payment_status: "cancelled",
    });

    return res.json({ ok: true, booking: updated });
  } catch (error) {
    console.error("Booking cancellation error:", error.message);
    return res.status(error.statusCode || 500).json({
      error: error.message || "Unable to cancel booking.",
    });
  }
});

const PORT = Number(process.env.PORT) || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`ZippyGo PayFlow backend listening on port ${PORT}`);
});
