export type ServiceType = "transfer" | "car_hire" | "parking";

export interface BookingExtras {
  meetGreet: boolean;
  childSeat: boolean;
  extraStops: boolean;
  flightTracking: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rateFromUSD: number;
}

export interface SearchParams {
  serviceType: ServiceType;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate?: string;
  returnTime?: string;
  roundTrip?: boolean;
  passengers: number;
  pickupAirportCode?: string;
  arrivalAirportCode?: string;
  destinationCity?: string;
  destinationCountry?: string;
  currency?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  routeDistanceKm?: number;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

export interface Area {
  id: string;
  name: string;
  type: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  hotels: Hotel[];
  areas: Area[];
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  airportCode: string;
  airportName: string;
  image: string;
  popular?: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  class: "economy" | "executive" | "luxury" | "van";
  image: string;
  passengers: number;
  luggage: number;
  doors: number;
  basePriceUSD: number;
  description: string;
  features: string[];
  transferMultiplier: number;
  carHireDailyMultiplier: number;
  parkingDailyUSD: number;
  priceUSD?: number;
}
