import type { Vehicle, Airport, Hotel, Area, Destination } from "./types";

export const VEHICLES: Vehicle[] = [
  {
    id: "shuttle-bus",
    name: "Shuttle Bus",
    class: "economy",
    image: "/vehicles/shuttle-bus.png",
    passengers: 16,
    luggage: 16,
    doors: 2,
    basePriceUSD: 35,
    description: "Shared economy shuttle bus for affordable airport transfers with scheduled departures.",
    features: ["Shared transfer", "Depart within 60 mins", "Professional driver", "Air conditioning"],
    transferMultiplier: 1,
    carHireDailyMultiplier: 1.2,
    parkingDailyUSD: 8,
  },
  {
    id: "express-shuttle",
    name: "Express Shuttle",
    class: "economy",
    image: "/vehicles/express-shuttle.png",
    passengers: 8,
    luggage: 8,
    doors: 4,
    basePriceUSD: 45,
    description: "Fast shared shuttle with a limited number of stops for a quicker airport-to-destination journey.",
    features: ["Maximum 4 stops", "Depart within 30 mins", "Air conditioning", "Professional driver"],
    transferMultiplier: 1.25,
    carHireDailyMultiplier: 1.4,
    parkingDailyUSD: 9,
  },
  {
    id: "private-transfer",
    name: "Private Transfer",
    class: "executive",
    image: "/vehicles/private-transfer.png",
    passengers: 4,
    luggage: 4,
    doors: 4,
    basePriceUSD: 52,
    description: "Private door-to-door airport transfer for up to 4 passengers with dedicated vehicle and driver.",
    features: ["Up to 4 passengers", "4 medium suitcases", "Door-to-door", "Professional driver"],
    transferMultiplier: 1,
    carHireDailyMultiplier: 1.6,
    parkingDailyUSD: 12,
  },
  {
    id: "private-minivan",
    name: "Private Minivan",
    class: "van",
    image: "/vehicles/private-minivan.png",
    passengers: 6,
    luggage: 6,
    doors: 5,
    basePriceUSD: 66,
    description: "Spacious private minivan for groups of up to 6 passengers with generous luggage capacity.",
    features: ["Up to 6 passengers", "6 medium suitcases", "Door-to-door", "Climate control"],
    transferMultiplier: 1,
    carHireDailyMultiplier: 2,
    parkingDailyUSD: 18,
  },
  {
    id: "premium-transfer",
    name: "Premium Transfer",
    class: "luxury",
    image: "/vehicles/premium-transfer.png",
    passengers: 4,
    luggage: 4,
    doors: 4,
    basePriceUSD: 74,
    description: "Premium chauffeur-style transfer for customers who want a more comfortable and refined journey.",
    features: ["Up to 4 passengers", "4 medium suitcases", "Porter service", "Door-to-door"],
    transferMultiplier: 1,
    carHireDailyMultiplier: 2.5,
    parkingDailyUSD: 20,
  },
];

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

export interface RemoteAirportOption extends Airport {
  latitude: number;
  longitude: number;
  countryName?: string;
}

export interface AirportDestinationOptions { airport: RemoteAirportOption; hotels: Hotel[]; areas: Area[]; }

export function getBackendUrl(): string {
  const configured = String(import.meta.env.VITE_BACKEND_URL || "").trim();
  const fallback = "https://zippygo-transfers-backend.onrender.com";
  return (configured || fallback).replace(/\/+$/, "");
}

export async function searchAirportsRemote(query: string): Promise<RemoteAirportOption[]> {
  const backend = getBackendUrl();
  if (!backend || !query.trim()) return [];
  const response = await fetch(`${backend}/api/airports/search?q=${encodeURIComponent(query.trim())}`);
  if (!response.ok) throw new Error(`Airport search failed (${response.status}).`);
  const data = await response.json();
  return Array.isArray(data.airports) ? data.airports : [];
}

export async function getAirportDestinationsRemote(airport: RemoteAirportOption): Promise<AirportDestinationOptions> {
  const backend = getBackendUrl();
  if (!backend) throw new Error("VITE_BACKEND_URL is not configured.");
  const response = await fetch(`${backend}/api/airports/${encodeURIComponent(airport.code)}/destinations?lat=${airport.latitude}&lon=${airport.longitude}&city=${encodeURIComponent(airport.city)}&country=${encodeURIComponent(airport.country)}`);
  if (!response.ok) throw new Error(`Destination lookup failed (${response.status}).`);
  const data = await response.json();
  return { airport, hotels: Array.isArray(data.hotels) ? data.hotels : [], areas: Array.isArray(data.areas) ? data.areas : [] };
}

export async function geocodeDestination(query: string, airport?: RemoteAirportOption): Promise<{ latitude: number; longitude: number; displayName: string } | null> {
  const backend = getBackendUrl();
  if (!backend || !query.trim()) return null;
  const params = new URLSearchParams({ q: query.trim() });
  if (airport?.city) params.set("airportCity", airport.city);
  if (airport?.country) params.set("airportCountry", airport.country);
  const response = await fetch(`${backend}/api/geocode?${params.toString()}`);
  if (!response.ok) return null;
  const data = await response.json();
  if (!Number.isFinite(Number(data.latitude)) || !Number.isFinite(Number(data.longitude))) return null;
  return { latitude: Number(data.latitude), longitude: Number(data.longitude), displayName: String(data.displayName || query) };
}
