import type { Vehicle, Airport, Hotel, Area } from "./types";

export const VEHICLES: Vehicle[] = [
  {
    id: "economy-sedan",
    name: "Economy Sedan",
    class: "economy",
    image: "https://images.pexels.com/photos/28673504/pexels-photo-28673504.jpeg?auto=compress&cs=tinysrgb&w=800",
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
    image: "https://images.pexels.com/photos/14764071/pexels-photo-14764071.jpeg?auto=compress&cs=tinysrgb&w=800",
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
    image: "https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?auto=compress&cs=tinysrgb&w=800",
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
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800",
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

export const AIRPORT_DATALIST: Airport[] = [
  {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    hotels: [
      { id: "h1", name: "The Ritz London", address: "150 Piccadilly, London W1J 9BR" },
      { id: "h2", name: "The Savoy", address: "Strand, London WC2R 0EZ" },
      { id: "h3", name: "Hilton London Heathrow Airport", address: "Terminal 4, Heathrow" },
      { id: "h4", name: "Sofitel London Heathrow", address: "Terminal 5, Heathrow" },
    ],
    areas: [
      { id: "a1", name: "Central London / Westminster", type: "city_center" },
      { id: "a2", name: "Kensington & Chelsea", type: "district" },
      { id: "a3", name: "Canary Wharf & Docklands", type: "district" },
      { id: "a4", name: "Mayfair & Soho", type: "district" },
    ],
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    hotels: [
      { id: "h5", name: "Burj Al Arab", address: "Jumeirah St, Dubai" },
      { id: "h6", name: "Atlantis The Palm", address: "Crescent Rd, Dubai" },
      { id: "h7", name: "JW Marriott Marquis Hotel", address: "Business Bay, Dubai" },
      { id: "h8", name: "Address Downtown", address: "Downtown Dubai" },
    ],
    areas: [
      { id: "a5", name: "Downtown Dubai & Burj Khalifa", type: "city_center" },
      { id: "a6", name: "Dubai Marina & JBR", type: "district" },
      { id: "a7", name: "Palm Jumeirah", type: "landmark" },
      { id: "a8", name: "Deira & Bur Dubai", type: "district" },
    ],
  },
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    hotels: [
      { id: "h9", name: "The Plaza Hotel", address: "768 5th Ave, New York" },
      { id: "h10", name: "TWA Hotel", address: "JFK Airport, Queens, NY" },
      { id: "h11", name: "The St. Regis New York", address: "Two E 55th St, New York" },
    ],
    areas: [
      { id: "a9", name: "Midtown Manhattan", type: "city_center" },
      { id: "a10", name: "Lower Manhattan / Financial District", type: "district" },
      { id: "a11", name: "Brooklyn Heights & DUMBO", type: "district" },
      { id: "a12", name: "Queens & Flushing", type: "suburb" },
    ],
  },
  {
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    hotels: [
      { id: "h12", name: "Ritz Paris", address: "15 Place Vendôme, Paris" },
      { id: "h13", name: "Pullman Paris Roissy CDG", address: "Roissypole, CDG Airport" },
      { id: "h14", name: "Four Seasons Hotel George V", address: "31 Av. George V, Paris" },
    ],
    areas: [
      { id: "a13", name: "Le Marais & 1st Arrondissement", type: "city_center" },
      { id: "a14", name: "Champs-Élysées & 8th Arrondissement", type: "district" },
      { id: "a15", name: "Montmartre & 18th Arrondissement", type: "district" },
      { id: "a16", name: "Latin Quarter & 5th Arrondissement", type: "district" },
    ],
  },
];

export function getAirportFromLocation(locationStr: string): Airport | undefined {
  if (!locationStr) return undefined;
  const match = locationStr.match(/\(([A-Z]{3})\)/);
  const code = match ? match[1] : locationStr.trim().toUpperCase();
  return AIRPORT_DATALIST.find(
    (a) => a.code === code || a.name.toLowerCase().includes(locationStr.toLowerCase())
  );
}

export function getAirportByCode(code: string): Airport | undefined {
  if (!code) return undefined;
  return AIRPORT_DATALIST.find((a) => a.code.toUpperCase() === code.toUpperCase());
}

export function getHotelsForAirport(airportCode: string): Hotel[] {
  if (!airportCode) return [];
  const airport = getAirportByCode(airportCode);
  return airport?.hotels || [];
}

export function getAreasForAirport(airportCode: string): Area[] {
  if (!airportCode) return [];
  const airport = getAirportByCode(airportCode);
  return airport?.areas || [];
}

export function getAirportsForCity(city: string): Airport[] {
  if (!city) return [];
  return AIRPORT_DATALIST.filter((a) => a.city.toLowerCase() === city.toLowerCase());
}
