const express = require("express");
const cors = require("cors");
const axios = require("axios");
const Razorpay = require("razorpay");

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
    data.message || data.error || `Appwrite returned HTTP ${response?.status ?? "unknown"}.`
  );
}

async function createBookingDocument(booking) {
  const config = requireAppwriteConfig();
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
    gateway: "Razorpay",
  });
});

app.get("/health", (_req, res) => {
  const razorpayConfigured = Boolean(env("RAZORPAY_KEY_ID") && env("RAZORPAY_KEY_SECRET"));
  const aw = appwriteConfig();
  const appwriteConfigured = Boolean(
    aw.projectId && aw.apiKey && aw.databaseId && aw.collectionId
  );
  res.json({
    ok: true,
    gateway: "Razorpay",
    razorpay_configured: razorpayConfigured,
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


// ==================== GLOBAL AIRPORT + DESTINATION SEARCH ====================
// OurAirports provides a worldwide IATA airport catalogue. Results are cached in memory
// so the public CSV is not downloaded for every customer search.
const airportCache = { loadedAt: 0, airports: [] };
const destinationCache = new Map();
const AIRPORT_CACHE_TTL = 24 * 60 * 60 * 1000;
const DESTINATION_CACHE_TTL = 6 * 60 * 60 * 1000;
const OUR_AIRPORTS_URL = "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function parseCsvLine(line) {
  const out = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(value); value = "";
    } else value += ch;
  }
  out.push(value);
  return out;
}

async function loadGlobalAirports() {
  if (airportCache.airports.length && Date.now() - airportCache.loadedAt < AIRPORT_CACHE_TTL) {
    return airportCache.airports;
  }
  const response = await axios.get(OUR_AIRPORTS_URL, {
    timeout: 30000,
    headers: { "User-Agent": "ZippyGoTransfers/1.0 airport-search" },
    responseType: "text",
  });
  const lines = String(response.data || "").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift() || "");
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  const airports = [];
  for (const line of lines) {
    const row = parseCsvLine(line);
    const type = row[idx.type] || "";
    const iata = row[idx.iata_code] || "";
    const name = row[idx.name] || "";
    const city = row[idx.municipality] || "";
    const country = row[idx.iso_country] || "";
    const lat = Number(row[idx.latitude_deg]);
    const lon = Number(row[idx.longitude_deg]);
    if (!iata || iata.length !== 3 || !name || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (!["large_airport", "medium_airport", "small_airport"].includes(type)) continue;
    airports.push({ code: iata.toUpperCase(), name, city, country, latitude: lat, longitude: lon });
  }
  airportCache.airports = airports;
  airportCache.loadedAt = Date.now();
  return airports;
}

app.get("/api/airports/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    if (!q) return res.json({ airports: [] });
    const airports = await loadGlobalAirports();
    const starts = [], contains = [];
    for (const airport of airports) {
      const hay = `${airport.code} ${airport.name} ${airport.city} ${airport.country}`.toLowerCase();
      if (airport.code.toLowerCase() === q) starts.unshift(airport);
      else if (hay.startsWith(q) || airport.name.toLowerCase().startsWith(q) || airport.city.toLowerCase().startsWith(q)) starts.push(airport);
      else if (hay.includes(q)) contains.push(airport);
    }
    const result = [...starts, ...contains].slice(0, 30);
    res.json({ airports: result, total_matches: starts.length + contains.length });
  } catch (error) {
    console.error("Global airport search error:", error.message);
    res.status(502).json({ airports: [], error: "Unable to load the global airport catalogue." });
  }
});

app.get("/api/airports/:code/destinations", async (req, res) => {
  try {
    const code = String(req.params.code || "").trim().toUpperCase();
    const lat = Number(req.query.lat), lon = Number(req.query.lon);
    const city = String(req.query.city || "").trim();
    const country = String(req.query.country || "").trim();
    if (!code || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: "Airport code and coordinates are required." });
    }
    const cached = destinationCache.get(code);
    if (cached && Date.now() - cached.loadedAt < DESTINATION_CACHE_TTL) return res.json(cached.data);

    const query = `
      [out:json][timeout:20];
      (
        nwr(around:15000,${lat},${lon})["tourism"="hotel"];
        nwr(around:15000,${lat},${lon})["tourism"="hostel"];
        nwr(around:15000,${lat},${lon})["place"~"suburb|neighbourhood|town|city"];
      );
      out center tags;
    `;
    const response = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
      timeout: 30000,
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "ZippyGoTransfers/1.0 destination-search" },
    });
    const elements = Array.isArray(response.data?.elements) ? response.data.elements : [];
    const hotels = [];
    const areas = [];
    for (const item of elements) {
      const tags = item.tags || {};
      const name = String(tags.name || "").trim();
      if (!name) continue;
      const id = `${code}-${item.type}-${item.id}`;
      if (tags.tourism === "hotel" || tags.tourism === "hostel") {
        const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"] || city].filter(Boolean).join(", ");
        hotels.push({ id, name, address: address || city });
      } else if (tags.place) {
        areas.push({ id, name, type: tags.place });
      }
    }
    const unique = (items) => Array.from(new Map(items.map((item) => [item.name.toLowerCase(), item])).values());
    const data = {
      airport: { code, name: `${code} Airport`, city, country, latitude: lat, longitude: lon },
      hotels: unique(hotels).slice(0, 60),
      areas: unique(areas).slice(0, 60),
    };
    destinationCache.set(code, { loadedAt: Date.now(), data });
    res.json(data);
  } catch (error) {
    console.error("Destination lookup error:", error.message);
    res.status(502).json({ hotels: [], areas: [], error: "Unable to load nearby hotels and areas." });
  }
});

// Razorpay Order Creation Route
app.post("/api/create-razorpay-order", async (req, res) => {
  let bookingRef = "";
  try {
    const razorpayKeyId = env("RAZORPAY_KEY_ID");
    const razorpayKeySecret = env("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        error: "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.",
      });
    }

    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    const body = req.body || {};
    const amount = Math.round(Number(body.amount) * 100) / 100;
    const currency = String(body.currency || "USD").toUpperCase();
    bookingRef = String(body.bookingRef || "").trim();

    const customer = body.customer || {};
    const booking = body.booking || {};

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid payment amount." });
    }
    if (!bookingRef || !/^[A-Z0-9-]{6,40}$/.test(bookingRef)) {
      return res.status(400).json({ success: false, error: "Invalid booking reference." });
    }

    const customerName = String(customer.name || "").trim();
    const customerEmail = String(customer.email || "").trim().toLowerCase();
    const customerPhone = String(customer.phone || "").replace(/\D/g, "").slice(-15);

    if (!customerName || !customerEmail) {
      return res.status(400).json({ success: false, error: "Customer name and email are required." });
    }

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
      extras: typeof booking.extras === "string" ? booking.extras : JSON.stringify(booking.extras || {}),
      booking_ref: bookingRef,
      payment_status: "pending",
    };

    try {
      await createBookingDocument({ bookingRef, data: bookingData });
    } catch (error) {
      if (error.statusCode === 409) {
        return res.status(409).json({
          success: false,
          error: "This booking reference already exists. Please try again.",
        });
      }
      console.error("Appwrite booking creation error:", error.message);
      return res.status(error.statusCode || 502).json({
        success: false,
        error: `Unable to save booking in Appwrite: ${error.message}`,
      });
    }

    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to base unit (e.g. cents/paise)
      currency: currency,
      receipt: bookingRef,
      notes: {
        bookingRef,
        customerName,
        customerEmail,
      },
    };

    let order;
    try {
      order = await razorpay.orders.create(orderOptions);
    } catch (rzpErr) {
      console.error("Razorpay order creation failed:", rzpErr);
      return res.status(400).json({
        success: false,
        error: rzpErr?.error?.description || rzpErr?.message || "Razorpay rejected order creation.",
      });
    }

    if (!order || !order.id) {
      return res.status(500).json({
        success: false,
        error: "Razorpay order creation returned an invalid order ID.",
      });
    }

    try {
      await updateBookingDocument(bookingRef, { payment_session_id: String(order.id) });
    } catch (err) {
      console.warn("Could not save payment_session_id to Appwrite:", err.message);
    }

    return res.json({
      success: true,
      gateway: "razorpay",
      bookingRef,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: razorpayKeyId,
    });
  } catch (error) {
    console.error("Razorpay order error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Unable to create Razorpay checkout order.",
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

    if (String(booking?.customer_email || "").trim().toLowerCase() !== email) {
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

    if (String(booking?.customer_email || "").trim().toLowerCase() !== email) {
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
  console.log(`ZippyGo Razorpay backend listening on port ${PORT}`);
});
