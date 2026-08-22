import type { Vehicle, Airport, Hotel, Area, Destination } from "./types";

export const VEHICLES: Vehicle[] = [
  {
    id: "economy-sedan",
    name: "Economy Sedan",
    class: "economy",
    image: "/vehicles/economy-sedan.svg",
    passengers: 3,
    luggage: 2,
    doors: 4,
    basePriceUSD: 35,
    description: "Comfortable and efficient for solo travelers and couples. Perfect for direct city-to-airport transfers.",
    features: ["Air conditioning", "Free Wi-Fi", "Professional driver", "Bottled water"],
    transferMultiplier: 1,
    carHireDailyMultiplier: 42,
    parkingDailyUSD: 8,
  },
  {
    id: "executive-sedan",
    name: "Executive Sedan",
    class: "executive",
    image: "/vehicles/executive-sedan.svg",
    passengers: 3,
    luggage: 3,
    doors: 4,
    basePriceUSD: 65,
    description: "Premium sedan designed for business travelers. Offers leather interiors and a smooth, quiet ride.",
    features: ["Leather seats", "Free Wi-Fi", "Phone chargers", "Bottled water", "Meet & greet"],
    transferMultiplier: 1.6,
    carHireDailyMultiplier: 78,
    parkingDailyUSD: 12,
  },
  {
    id: "luxury-sedan",
    name: "Luxury Sedan",
    class: "luxury",
    image: "/vehicles/luxury-sedan.svg",
    passengers: 3,
    luggage: 3,
    doors: 4,
    basePriceUSD: 110,
    description: "Top-tier luxury vehicles for high-profile business or special occasion transfers.",
    features: ["First-class comfort", "Wi-Fi & chargers", "Premium audio", "Chauffeur service"],
    transferMultiplier: 2.5,
    carHireDailyMultiplier: 150,
    parkingDailyUSD: 20,
  },
  {
    id: "passenger-van",
    name: "Executive Van / Minivan",
    class: "van",
    image: "/vehicles/executive-van.svg",
    passengers: 7,
    luggage: 7,
    doors: 5,
    basePriceUSD: 95,
    description: "Spacious multi-seater van perfect for larger families, tour groups, or extra luggage requirements.",
    features: ["Extra luggage space", "Leather seating", "Climate control", "Child seat available"],
    transferMultiplier: 2.2,
    carHireDailyMultiplier: 110,
    parkingDailyUSD: 18,
  },
];

export const SHUTTLE_VEHICLE: Vehicle = {
  id: "shared-shuttle",
  name: "Shared Shuttle",
  class: "van",
  image: "/vehicles/executive-van.svg",
  passengers: 8,
  luggage: 8,
  doors: 5,
  basePriceUSD: 28,
  description: "Cost-effective shared airport shuttle with scheduled pickup and drop-off at your selected destination.",
  features: ["Shared ride", "Air conditioning", "Professional driver", "Luggage space"],
  transferMultiplier: 1,
  carHireDailyMultiplier: 0,
  parkingDailyUSD: 0,
  transferMode: "shuttle",
  transferOnly: true,
};

export const DESTINATIONS: Destination[] = [
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    airportCode: "LHR",
    airportName: "London Heathrow Airport",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800",
    popular: true,
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    airportCode: "DXB",
    airportName: "Dubai International Airport",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800",
    popular: true,
  },
  {
    id: "new-york",
    city: "New York",
    country: "United States",
    airportCode: "JFK",
    airportName: "John F. Kennedy International Airport",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800",
    popular: true,
  },
  {
    id: "paris",
    city: "Paris",
    country: "France",
    airportCode: "CDG",
    airportName: "Charles de Gaulle Airport",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800",
    popular: true,
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    airportCode: "NRT",
    airportName: "Narita International Airport",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800",
    popular: true,
  },
  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    airportCode: "SIN",
    airportName: "Changi Airport",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800",
    popular: true,
  },
];

export interface ServiceOption {
  id: "transfer" | "car_hire" | "parking";
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
}

export const SERVICES: ServiceOption[] = [
  {
    id: "transfer",
    title: "Airport Transfers",
    subtitle: "Door-to-door rides worldwide",
    description: "Direct door-to-door private airport pickups with flight tracking and transparent upfront rates.",
    iconName: "Plane",
  },
  {
    id: "car_hire",
    title: "Car Hire",
    subtitle: "Drive at your own pace",
    description: "Self-drive vehicle rentals with flexible pickup locations and unlimited mileage options.",
    iconName: "Car",
  },
  {
    id: "parking",
    title: "Airport Parking",
    subtitle: "Secure parking options",
    description: "Secure terminal & off-site reserved parking spots with 24/7 CCTV surveillance.",
    iconName: "ParkingCircle",
  },
];

export const AIRPORT_DATALIST: Airport[] = [
  {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    hotels: [
      { id: "lhr-1", name: "The Ritz London", address: "150 Piccadilly, London W1J 9BR" },
      { id: "lhr-2", name: "The Savoy", address: "Strand, London WC2R 0EZ" },
      { id: "lhr-3", name: "Hilton London Heathrow Airport", address: "Terminal 4, Heathrow" },
      { id: "lhr-4", name: "Sofitel London Heathrow", address: "Terminal 5, Heathrow" },
    ],
    areas: [
      { id: "lhr-a1", name: "Central London / Westminster", type: "city_center" },
      { id: "lhr-a2", name: "Kensington & Chelsea", type: "district" },
      { id: "lhr-a3", name: "Canary Wharf & Docklands", type: "district" },
      { id: "lhr-a4", name: "Mayfair & Soho", type: "district" },
    ],
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    hotels: [
      { id: "dxb-1", name: "Burj Al Arab", address: "Jumeirah St, Dubai" },
      { id: "dxb-2", name: "Atlantis The Palm", address: "Crescent Rd, Dubai" },
      { id: "dxb-3", name: "JW Marriott Marquis Hotel", address: "Business Bay, Dubai" },
      { id: "dxb-4", name: "Address Downtown", address: "Downtown Dubai" },
    ],
    areas: [
      { id: "dxb-a1", name: "Downtown Dubai & Burj Khalifa", type: "city_center" },
      { id: "dxb-a2", name: "Dubai Marina & JBR", type: "district" },
      { id: "dxb-a3", name: "Palm Jumeirah", type: "landmark" },
      { id: "dxb-a4", name: "Deira & Bur Dubai", type: "district" },
    ],
  },
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    hotels: [
      { id: "jfk-1", name: "The Plaza Hotel", address: "768 5th Ave, New York" },
      { id: "jfk-2", name: "TWA Hotel", address: "JFK Airport, Queens, NY" },
      { id: "jfk-3", name: "The St. Regis New York", address: "Two E 55th St, New York" },
    ],
    areas: [
      { id: "jfk-a1", name: "Midtown Manhattan", type: "city_center" },
      { id: "jfk-a2", name: "Lower Manhattan / Financial District", type: "district" },
      { id: "jfk-a3", name: "Brooklyn Heights & DUMBO", type: "district" },
    ],
  },
  {
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    hotels: [
      { id: "cdg-1", name: "Ritz Paris", address: "15 Place Vendôme, Paris" },
      { id: "cdg-2", name: "Pullman Paris Roissy CDG", address: "Roissypole, CDG Airport" },
      { id: "cdg-3", name: "Four Seasons Hotel George V", address: "31 Av. George V, Paris" },
    ],
    areas: [
      { id: "cdg-a1", name: "Le Marais & 1st Arrondissement", type: "city_center" },
      { id: "cdg-a2", name: "Champs-Élysées & 8th Arrondissement", type: "district" },
      { id: "cdg-a3", name: "Montmartre & 18th Arrondissement", type: "district" },
    ],
  },
  {
    code: "SIN",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
    hotels: [
      { id: "sin-1", name: "Marina Bay Sands", address: "10 Bayfront Ave, Singapore" },
      { id: "sin-2", name: "Raffles Singapore", address: "1 Beach Rd, Singapore" },
      { id: "sin-3", name: "Crowne Plaza Changi Airport", address: "75 Airport Blvd, Singapore" },
    ],
    areas: [
      { id: "sin-a1", name: "Marina Bay & Downtown Core", type: "city_center" },
      { id: "sin-a2", name: "Orchard Road", type: "shopping_district" },
      { id: "sin-a3", name: "Sentosa Island", type: "resort_area" },
    ],
  },
];

export function getAirportByCode(code: string): Airport | undefined {
  if (!code) return undefined;
  const cleanCode = code.trim().toUpperCase();
  return AIRPORT_DATALIST.find((a) => a.code === cleanCode);
}

export function getAirportFromLocation(locationStr: string): Airport | undefined {
  if (!locationStr) return undefined;
  
  const codeMatch = locationStr.match(/\(([A-Z]{3})\)/) || locationStr.match(/^([A-Z]{3})\b/i);
  if (codeMatch) {
    const airport = getAirportByCode(codeMatch[1]);
    if (airport) return airport;
  }

  const query = locationStr.toLowerCase().trim();
  return AIRPORT_DATALIST.find(
    (a) =>
      a.code.toLowerCase() === query ||
      a.name.toLowerCase().includes(query) ||
      a.city.toLowerCase() === query
  );
}

export function getHotelsForAirport(airportCode: string): Hotel[] {
  const airport = getAirportByCode(airportCode);
  return airport ? airport.hotels : [];
}

export function getAreasForAirport(airportCode: string): Area[] {
  const airport = getAirportByCode(airportCode);
  return airport ? airport.areas : [];
}

export function getAirportsForCity(city: string): Airport[] {
  if (!city) return [];
  const query = city.toLowerCase().trim();
  return AIRPORT_DATALIST.filter((a) => a.city.toLowerCase() === query);
}


const COUNTRY_CURRENCY: Record<string, string> = {
  "United Kingdom": "GBP", "United States": "USD", "France": "EUR", "Germany": "EUR", "Spain": "EUR", "Italy": "EUR", "Portugal": "EUR", "Netherlands": "EUR", "Belgium": "EUR", "Austria": "EUR", "Ireland": "EUR", "Greece": "EUR", "Finland": "EUR", "Sweden": "SEK", "Norway": "NOK", "Denmark": "DKK", "Switzerland": "CHF", "Poland": "PLN", "Czechia": "CZK", "Czech Republic": "CZK", "Hungary": "HUF", "Romania": "RON", "Bulgaria": "BGN", "Turkey": "TRY", "India": "INR", "United Arab Emirates": "AED", "Japan": "JPY", "Singapore": "SGD", "Australia": "AUD", "Canada": "CAD", "Thailand": "THB", "South Africa": "ZAR", "Qatar": "QAR", "Saudi Arabia": "SAR", "Egypt": "EGP", "Morocco": "MAD", "Brazil": "BRL", "Mexico": "MXN", "Malaysia": "MYR", "Indonesia": "IDR", "Philippines": "PHP", "South Korea": "KRW", "Taiwan": "TWD", "China": "CNY", "New Zealand": "NZD"
};

export function getLocalCurrencyForCountry(country: string): string {
  const normalized = country.trim().toLowerCase();
  const match = Object.entries(COUNTRY_CURRENCY).find(([name]) => name.toLowerCase() === normalized);
  return match?.[1] || "USD";
}

export interface RemoteAirportOption extends Omit<Airport, "hotels" | "areas"> {
  latitude: number;
  longitude: number;
}

export interface AirportDestinationOptions { airport: RemoteAirportOption; hotels: Hotel[]; areas: Area[]; }

export function getBackendUrl(): string {
  return String(import.meta.env.VITE_BACKEND_URL || "").trim().replace(/\/+$/, "");
}

let globalAirportCache: RemoteAirportOption[] | null = null;
let globalAirportPromise: Promise<RemoteAirportOption[]> | null = null;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i += 1; }
      else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      values.push(value); value = "";
    } else value += ch;
  }
  values.push(value);
  return values;
}

async function loadGlobalAirportFallback(): Promise<RemoteAirportOption[]> {
  if (globalAirportCache) return globalAirportCache;
  if (globalAirportPromise) return globalAirportPromise;
  globalAirportPromise = fetch("https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv")
    .then(async (response) => {
      if (!response.ok) throw new Error(`Global airport catalogue failed (${response.status}).`);
      const lines = (await response.text()).split(/\r?\n/).filter(Boolean);
      const headers = parseCsvLine(lines.shift() || "");
      const index = Object.fromEntries(headers.map((header, i) => [header, i]));
      const airports: RemoteAirportOption[] = [];
      for (const line of lines) {
        const row = parseCsvLine(line);
        const type = row[index.type] || "";
        const code = row[index.iata_code] || "";
        const latitude = Number(row[index.latitude_deg]);
        const longitude = Number(row[index.longitude_deg]);
        if (!code || code.length !== 3 || !["large_airport", "medium_airport", "small_airport"].includes(type)) continue;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
        airports.push({
          code: code.toUpperCase(),
          name: row[index.name] || `${code} Airport`,
          city: row[index.municipality] || "",
          country: row[index.iso_country] || "",
          latitude,
          longitude,
        });
      }
      globalAirportCache = airports;
      return airports;
    })
    .finally(() => { globalAirportPromise = null; });
  return globalAirportPromise;
}

export async function searchAirportsRemote(query: string): Promise<RemoteAirportOption[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];
  const backend = getBackendUrl();
  if (backend) {
    const response = await fetch(`${backend}/api/airports/search?q=${encodeURIComponent(cleanQuery)}`);
    if (!response.ok) throw new Error(`Airport search failed (${response.status}).`);
    const data = await response.json();
    return Array.isArray(data.airports) ? data.airports : [];
  }

  // Global fallback: works even when the optional backend URL is not configured.
  const airports = await loadGlobalAirportFallback();
  const q = cleanQuery.toLowerCase();
  return airports
    .map((airport) => {
      const exact = airport.code.toLowerCase() === q;
      const starts = [airport.code, airport.name, airport.city].some((v) => v.toLowerCase().startsWith(q));
      const contains = `${airport.code} ${airport.name} ${airport.city} ${airport.country}`.toLowerCase().includes(q);
      return { airport, score: exact ? 3 : starts ? 2 : contains ? 1 : 0 };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((item) => item.airport);
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

function uniqueByName<T extends { name: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.name.trim().toLowerCase(), item])).values());
}

async function fetchNearbyDestinationsDirect(airport: RemoteAirportOption): Promise<AirportDestinationOptions> {
  const query = `
    [out:json][timeout:25];
    (
      nwr(around:20000,${airport.latitude},${airport.longitude})["tourism"~"hotel|hostel"];
      nwr(around:20000,${airport.latitude},${airport.longitude})["place"~"suburb|neighbourhood|town|city|quarter"];
    );
    out center tags;
  `;

  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!response.ok) throw new Error(`Nearby lookup failed (${response.status})`);
      const payload = await response.json();
      const elements = Array.isArray(payload?.elements) ? payload.elements : [];
      const hotels: Hotel[] = [];
      const areas: Area[] = [];

      for (const item of elements) {
        const tags = item?.tags || {};
        const name = String(tags.name || "").trim();
        if (!name) continue;
        const id = `${airport.code}-${item.type}-${item.id}`;
        if (tags.tourism === "hotel" || tags.tourism === "hostel") {
          const address = [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:city"] || airport.city,
          ].filter(Boolean).join(", ");
          hotels.push({ id, name, address: address || airport.city });
        } else if (tags.place) {
          areas.push({ id, name, type: String(tags.place) });
        }
      }

      return {
        airport,
        hotels: uniqueByName(hotels).slice(0, 80),
        areas: uniqueByName(areas).slice(0, 80),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Unable to load nearby destinations worldwide.");
}

async function fetchNearbyDestinationsFromNominatim(airport: RemoteAirportOption): Promise<AirportDestinationOptions> {
  const base = "https://nominatim.openstreetmap.org/search";
  const queries = [
    `hotels near ${airport.name}, ${airport.city}`,
    `${airport.city}, ${airport.country}`,
  ];
  const hotels: Hotel[] = [];
  const areas: Area[] = [];

  for (const q of queries) {
    const url = `${base}?format=jsonv2&limit=40&dedupe=1&q=${encodeURIComponent(q)}&lat=${airport.latitude}&lon=${airport.longitude}`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) continue;
    const results = await response.json();
    if (!Array.isArray(results)) continue;

    for (const item of results) {
      const name = String(item?.name || item?.display_name?.split(",")[0] || "").trim();
      if (!name) continue;
      const category = String(item?.type || item?.class || "").toLowerCase();
      const id = `${airport.code}-nominatim-${item.place_id || name}`;
      const address = String(item?.display_name || airport.city);
      if (q.startsWith("hotels") || ["hotel", "hostel", "guest_house", "motel", "resort"].includes(category)) {
        hotels.push({ id, name, address });
      } else {
        areas.push({ id, name, type: category || "area" });
      }
    }
  }

  return { airport, hotels: uniqueByName(hotels).slice(0, 80), areas: uniqueByName(areas).slice(0, 80) };
}

export async function getAirportDestinationsRemote(airport: RemoteAirportOption): Promise<AirportDestinationOptions> {
  const backend = getBackendUrl();
  if (backend) {
    try {
      const response = await fetch(`${backend}/api/airports/${encodeURIComponent(airport.code)}/destinations?lat=${airport.latitude}&lon=${airport.longitude}&city=${encodeURIComponent(airport.city)}&country=${encodeURIComponent(airport.country)}`);
      if (response.ok) {
        const data = await response.json();
        const result = { airport, hotels: Array.isArray(data.hotels) ? data.hotels : [], areas: Array.isArray(data.areas) ? data.areas : [] };
        if (result.hotels.length || result.areas.length) return result;
      }
    } catch (error) {
      console.warn("Backend nearby destination lookup failed; trying global OpenStreetMap lookup.", error);
    }
  }

  try {
    return await fetchNearbyDestinationsDirect(airport);
  } catch (error) {
    console.warn("Direct Overpass lookup failed; trying Nominatim fallback.", error);
    return fetchNearbyDestinationsFromNominatim(airport);
  }
}

