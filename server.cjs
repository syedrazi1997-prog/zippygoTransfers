const express = require("express");
const cors = require("cors");
const axios = require("axios");
const Razorpay = require("razorpay");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: true, methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], credentials: false }));
app.options("*", cors());

function env(name, fallback = "") { return String(process.env[name] ?? fallback).trim(); }
function appwriteConfig() {
  return { endpoint: env("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1").replace(/\/+$/, ""), projectId: env("APPWRITE_PROJECT_ID"), apiKey: env("APPWRITE_API_KEY"), databaseId: env("APPWRITE_DATABASE_ID"), collectionId: env("APPWRITE_BOOKINGS_COLLECTION_ID", "bookings") };
}
function requireAppwriteConfig() {
  const c = appwriteConfig();
  const missing = ["projectId", "apiKey", "databaseId", "collectionId"].filter((k) => !c[k]);
  if (missing.length) { const e = new Error(`Appwrite is not configured. Missing: ${missing.map((x) => ({ projectId: "APPWRITE_PROJECT_ID", apiKey: "APPWRITE_API_KEY", databaseId: "APPWRITE_DATABASE_ID", collectionId: "APPWRITE_BOOKINGS_COLLECTION_ID" }[x])).join(", ")}`); e.statusCode = 500; throw e; }
  return c;
}
function appwriteHeaders(c) { return { "X-Appwrite-Project": c.projectId, "X-Appwrite-Key": c.apiKey, "Content-Type": "application/json", Accept: "application/json" }; }
async function appwriteRequest(method, path, c, data, params) { return axios({ method, url: `${c.endpoint}${path}`, headers: appwriteHeaders(c), data, params, timeout: 15000, validateStatus: () => true }); }
function appwriteErrorMessage(response) { return response?.data?.message || response?.data?.error || `Appwrite returned HTTP ${response?.status ?? "unknown"}.`; }

async function createBookingDocument(booking) {
  const c = requireAppwriteConfig();
  const r = await appwriteRequest("POST", `/databases/${encodeURIComponent(c.databaseId)}/collections/${encodeURIComponent(c.collectionId)}/documents`, c, { documentId: booking.bookingRef, data: booking.data });
  if (r.status < 200 || r.status >= 300) { const e = new Error(appwriteErrorMessage(r)); e.statusCode = r.status === 409 ? 409 : 502; throw e; }
  return r.data;
}
async function getBookingDocument(bookingRef) {
  const c = requireAppwriteConfig();
  const r = await appwriteRequest("GET", `/databases/${encodeURIComponent(c.databaseId)}/collections/${encodeURIComponent(c.collectionId)}/documents/${encodeURIComponent(bookingRef)}`, c);
  if (r.status < 200 || r.status >= 300) { const e = new Error(appwriteErrorMessage(r)); e.statusCode = r.status === 404 ? 404 : 502; throw e; }
  return r.data;
}
async function updateBookingDocument(bookingRef, data) {
  const c = requireAppwriteConfig();
  const r = await appwriteRequest("PATCH", `/databases/${encodeURIComponent(c.databaseId)}/collections/${encodeURIComponent(c.collectionId)}/documents/${encodeURIComponent(bookingRef)}`, c, { data });
  if (r.status < 200 || r.status >= 300) { const e = new Error(appwriteErrorMessage(r)); e.statusCode = 502; throw e; }
  return r.data;
}

function validBookingRef(ref) { return /^[A-Z0-9-]{6,40}$/.test(ref); }
function normalizePhone(value) { return String(value || "").replace(/\D/g, "").slice(-15); }
app.get("/", (_req, res) => res.json({ ok: true, service: "ZippyGo backend", gateway: "Razorpay" }));
app.get("/health", (_req, res) => {
  const aw = appwriteConfig();
  res.json({ ok: true, gateway: "Razorpay", maps_provider: env("GOOGLE_MAPS_API_KEY") ? "google-places-with-osm-fallback" : "openstreetmap", appwrite_configured: Boolean(aw.projectId && aw.apiKey && aw.databaseId && aw.collectionId) });
});
app.get("/api/appwrite/status", async (_req, res) => {
  try { const c = requireAppwriteConfig(); const r = await appwriteRequest("GET", `/databases/${encodeURIComponent(c.databaseId)}/collections/${encodeURIComponent(c.collectionId)}`, c); if (r.status < 200 || r.status >= 300) return res.status(502).json({ ok: false, error: appwriteErrorMessage(r), provider_status: r.status }); return res.json({ ok: true, database_id: c.databaseId, collection_id: c.collectionId, collection_name: r.data?.name || null }); }
  catch (e) { console.error("Appwrite status error:", e.message); return res.status(e.statusCode || 500).json({ ok: false, error: e.message || "Unable to connect to Appwrite." }); }
});

// ---------- Global airport search (OurAirports) ----------
let airportCache = null;
let airportCacheLoadedAt = 0;
function parseCsvLine(line) {
  const out = []; let field = ""; let quoted = false;
  for (let i = 0; i < line.length; i++) { const ch = line[i]; if (ch === '"') { if (quoted && line[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; } else if (ch === ',' && !quoted) { out.push(field); field = ""; } else field += ch; }
  out.push(field); return out;
}
async function getAirports() {
  if (airportCache && Date.now() - airportCacheLoadedAt < 24 * 60 * 60 * 1000) return airportCache;
  const url = "https://ourairports.com/data/airports.csv";
  const response = await axios.get(url, { timeout: 30000, responseType: "text" });
  const lines = response.data.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines.shift()); const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  airportCache = lines.map((line) => { const v = parseCsvLine(line); return { code: (v[idx.iata_code] || "").trim().toUpperCase(), name: v[idx.name] || "", city: v[idx.municipality] || "", country: v[idx.iso_country] || "", latitude: Number(v[idx.latitude_deg]), longitude: Number(v[idx.longitude_deg]), type: v[idx.type] || "" }; }).filter((a) => /^[A-Z]{3}$/.test(a.code) && Number.isFinite(a.latitude) && Number.isFinite(a.longitude) && !["closed", "heliport", "seaplane_base"].includes(a.type));
  airportCacheLoadedAt = Date.now(); return airportCache;
}
app.get("/api/airports/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    if (q.length < 2) return res.json({ airports: [] });
    const airports = await getAirports();
    const scored = airports.map((a) => {
      const code = a.code.toLowerCase(), name = a.name.toLowerCase(), city = a.city.toLowerCase(); let score = 0;
      if (code === q) score = 100; else if (code.startsWith(q)) score = 90; else if (name.startsWith(q)) score = 80; else if (name.includes(q)) score = 65; else if (city === q) score = 60; else if (city.startsWith(q)) score = 55; else if (city.includes(q)) score = 45;
      return { ...a, score };
    }).filter((a) => a.score > 0).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, 12);
    res.set("Cache-Control", "public, max-age=300"); return res.json({ airports: scored });
  } catch (e) { console.error("Airport search error:", e.message); return res.status(502).json({ airports: [], error: "Global airport database is temporarily unavailable." }); }
});

// ---------- Nearby hotels and areas from OpenStreetMap ----------

// ---------- Free GeoNames place search (optional, free account) ----------
// GeoNames complements OSM with structured cities/places. Set GEONAMES_USERNAME
// to a free GeoNames username. OSM/Overpass remains the default and requires no key.
async function geonamesNearbyPlaces(lat, lon, maxRows = 25) {
  const username = env("GEONAMES_USERNAME");
  if (!username) return [];
  const r = await axios.get("https://secure.geonames.org/findNearbyPlaceNameJSON", {
    params: { lat, lng: lon, radius: 30, maxRows, username },
    timeout: 12000,
    validateStatus: () => true,
  });
  if (r.status < 200 || r.status >= 300) throw new Error(`GeoNames returned HTTP ${r.status}`);
  if (r.data?.status) throw new Error(r.data.status.message || "GeoNames request failed");
  return Array.isArray(r.data?.geonames) ? r.data.geonames : [];
}

async function googleNearbyPlaces(lat, lon, text, maxResultCount = 15) {
  const key = env("GOOGLE_MAPS_API_KEY");
  if (!key) return [];
  const r = await axios.post("https://places.googleapis.com/v1/places:searchText", {
    textQuery: text,
    maxResultCount,
    locationBias: { circle: { center: { latitude: lat, longitude: lon }, radius: 20000 } },
  }, { headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location" }, timeout: 15000, validateStatus: () => true });
  if (r.status < 200 || r.status >= 300) throw new Error(`Google Places returned HTTP ${r.status}`);
  return Array.isArray(r.data?.places) ? r.data.places : [];
}

app.get("/api/airports/:code/destinations", async (req, res) => {
  const lat = Number(req.query.lat), lon = Number(req.query.lon), city = String(req.query.city || "").trim(), country = String(req.query.country || "").trim();
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return res.status(400).json({ error: "Valid airport coordinates are required." });
  try {
    if (env("GOOGLE_MAPS_API_KEY")) {
      try {
        const [googleHotels, googleAreas] = await Promise.all([
          googleNearbyPlaces(lat, lon, `hotels near ${city || "airport"}`, 20),
          googleNearbyPlaces(lat, lon, `neighbourhoods and areas near ${city || "airport"}`, 20),
        ]);
        const distanceKm = (aLat, aLon) => { const rad = Math.PI / 180, dLat = (aLat - lat) * rad, dLon = (aLon - lon) * rad; const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat * rad) * Math.cos(aLat * rad) * Math.sin(dLon / 2) ** 2; return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)); };
        const hotels = googleHotels.map((p, i) => ({ id: p.id || `google-hotel-${i}`, name: p.displayName?.text || "Hotel", address: p.formattedAddress || "", distanceKm: Number.isFinite(p.location?.latitude) ? Math.round(distanceKm(p.location.latitude, p.location.longitude) * 10) / 10 : 99999 }));
        const areas = googleAreas.map((p, i) => ({ id: p.id || `google-area-${i}`, name: p.displayName?.text || "Area", type: "area", distanceKm: Number.isFinite(p.location?.latitude) ? Math.round(distanceKm(p.location.latitude, p.location.longitude) * 10) / 10 : 99999 }));
        hotels.sort((a,b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name)); areas.sort((a,b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name));
        return res.json({ hotels: hotels.slice(0, 25), areas: areas.slice(0, 25), provider: "google" });
      } catch (googleError) { console.warn("Google Places failed; falling back to OpenStreetMap:", googleError.message); }
    }
    let geoPlaces = [];
    if (env("GEONAMES_USERNAME")) {
      try { geoPlaces = await geonamesNearbyPlaces(lat, lon, 25); }
      catch (geoError) { console.warn("GeoNames failed; continuing with OpenStreetMap:", geoError.message); }
    }
    const query = `[out:json][timeout:20];(nwr(around:20000,${lat},${lon})[tourism=hotel];nwr(around:20000,${lat},${lon})[place~"^(neighbourhood|suburb|village|town|city)$"];);out center tags;`;
    const r = await axios.post("https://overpass-api.de/api/interpreter", query, { headers: { "Content-Type": "text/plain", "User-Agent": "ZippyGoTransfers/1.1 (+https://zippygo.com)" }, timeout: 25000 });
    const hotels = [], areas = [], seenHotels = new Set(), seenAreas = new Set();
    const distanceKm = (aLat, aLon) => {
      const rad = Math.PI / 180, dLat = (aLat - lat) * rad, dLon = (aLon - lon) * rad;
      const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat * rad) * Math.cos(aLat * rad) * Math.sin(dLon / 2) ** 2;
      return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    };
    for (const place of geoPlaces) {
      const name = String(place.name || "").trim(); if (!name) continue;
      const pLat = Number(place.lat), pLon = Number(place.lng);
      const distance = Number.isFinite(pLat) && Number.isFinite(pLon) ? distanceKm(pLat, pLon) : 99999;
      const key = name.toLowerCase();
      if (!seenAreas.has(key)) {
        seenAreas.add(key);
        areas.push({ id: `geonames-${place.geonameId || key}`, name, type: String(place.fcodeName || place.fcode || "place").toLowerCase(), distanceKm: Math.round(distance * 10) / 10 });
      }
    }
    for (const item of r.data?.elements || []) {
      const tags = item.tags || {}, name = String(tags.name || "").trim(); if (!name) continue;
      const itemLat = Number(item.lat ?? item.center?.lat), itemLon = Number(item.lon ?? item.center?.lon);
      const distance = Number.isFinite(itemLat) && Number.isFinite(itemLon) ? distanceKm(itemLat, itemLon) : 99999;
      const id = `${item.type}-${item.id}`;
      if (tags.tourism === "hotel" && !seenHotels.has(name.toLowerCase())) { seenHotels.add(name.toLowerCase()); hotels.push({ id, name, address: [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"] || city, tags["addr:country"] || country].filter(Boolean).join(", "), distanceKm: Math.round(distance * 10) / 10 }); }
      if (tags.place && !seenAreas.has(name.toLowerCase())) { seenAreas.add(name.toLowerCase()); areas.push({ id, name, type: tags.place, distanceKm: Math.round(distance * 10) / 10 }); }
    }
    hotels.sort((a,b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name)); areas.sort((a,b) => a.distanceKm - b.distanceKm || a.name.localeCompare(b.name));
    res.set("Cache-Control", "public, max-age=900"); return res.json({ hotels: hotels.slice(0, 25), areas: areas.slice(0, 25), provider: env("GEONAMES_USERNAME") ? "openstreetmap+geonames" : "openstreetmap" });
  } catch (e) { console.error("Nearby destination lookup error:", e.message); return res.status(502).json({ hotels: [], areas: [], error: "Nearby hotel and area search is temporarily unavailable." }); }
});

app.post("/api/bookings/find", async (req, res) => {
  try { const bookingRef = String(req.body?.bookingRef || "").trim().toUpperCase(), email = String(req.body?.email || "").trim().toLowerCase(); if (!validBookingRef(bookingRef) || !email) return res.status(400).json({ error: "Booking reference and email are required." }); const booking = await getBookingDocument(bookingRef); if (String(booking?.customer_email || "").toLowerCase() !== email) return res.status(404).json({ error: "No booking found with this reference and email." }); return res.json({ ok: true, booking }); }
  catch (e) { return res.status(e.statusCode || 500).json({ error: e.statusCode === 404 ? "No booking found with this reference and email." : e.message || "Unable to search for booking." }); }
});
app.patch("/api/bookings/:bookingRef/cancel", async (req, res) => {
  try { const bookingRef = String(req.params.bookingRef || "").trim().toUpperCase(), email = String(req.body?.email || "").trim().toLowerCase(); if (!validBookingRef(bookingRef) || !email) return res.status(400).json({ error: "Booking reference and email are required." }); const booking = await getBookingDocument(bookingRef); if (String(booking?.customer_email || "").toLowerCase() !== email) return res.status(404).json({ error: "Booking not found." }); if (String(booking?.payment_status || "").toLowerCase() === "cancelled") return res.json({ ok: true, booking }); const updated = await updateBookingDocument(bookingRef, { payment_status: "cancelled" }); return res.json({ ok: true, booking: updated }); }
  catch (e) { return res.status(e.statusCode || 500).json({ error: e.message || "Unable to cancel booking." }); }
});

const PORT = Number(process.env.PORT) || 10000;


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

app.listen(PORT, "0.0.0.0", () => console.log(`ZippyGo backend listening on port ${PORT}`));
