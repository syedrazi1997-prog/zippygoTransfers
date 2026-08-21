import type { Vehicle, Airport, Hotel } from "./types";

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

export interface PopularDestination {
  id: string;
  city: string;
  airport: string;
  code: string;
  image: string;
}

export const POPULAR_DESTINATIONS: PopularDestination[] = [
  {
    id: "london",
    city: "London",
    airport: "Heathrow Airport",
    code: "LHR",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "dubai",
    city: "Dubai",
    airport: "Dubai International Airport",
    code: "DXB",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "new-york",
    city: "New York",
    airport: "John F. Kennedy International",
    code: "JFK",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "paris",
    city: "Paris",
    airport: "Charles de Gaulle Airport",
    code: "CDG",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "tokyo",
    city: "Tokyo",
    airport: "Narita International Airport",
    code: "NRT",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "singapore",
    city: "Singapore",
    airport: "Changi Airport",
    code: "SIN",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800",
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
      { id: "h1", name: "The Ritz London", address: "150 Piccadilly, London W1J 9BR" },
      { id: "h2", name: "The Savoy", address: "Strand, London WC2R 0EZ" },
      { id: "h3", name: "Hilton London Heathrow Airport", address: "Terminal 4, Heathrow" },
    ],
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    hotels: [
      { id: "h4", name: "Burj Al Arab", address: "Jumeirah St, Dubai" },
      { id: "h5", name: "Atlantis The Palm", address: "Crescent Rd, Dubai" },
      { id: "h6", name: "JW Marriott Marquis Hotel", address: "Business Bay, Dubai" },
    ],
  },
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    hotels: [
      { id: "h7", name: "The Plaza Hotel", address: "768 5th Ave, New York" },
      { id: "h8", name: "TWA Hotel", address: "JFK Airport, Queens, NY" },
    ],
  },
  {
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    hotels: [
      { id: "h9", name: "Ritz Paris", address: "15 Place Vendôme, Paris" },
      { id: "h10", name: "Pullman Paris Roissy CDG", address: "Roissypole, CDG Airport" },
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

export function getAirportsForCity(city: string): Airport[] {
  if (!city) return [];
  return AIRPORT_DATALIST.filter((a) => a.city.toLowerCase() === city.toLowerCase());
}
