import type { Airport, Hotel, Area } from "./types";

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
  
  // Look for 3-letter code inside brackets or exact match
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
