export type ServiceType = "transfer" | "car_hire" | "parking";

export type VehicleClass = "economy" | "executive" | "luxury" | "suv" | "van" | "minibus";

export interface Vehicle {
  id: string;
  name: string;
  class: VehicleClass;
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
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rateFromUSD: number;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  airportCode: string;
  airportName: string;
  image: string;
  popular: boolean;
}

export interface SearchParams {
  serviceType: ServiceType;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  roundTrip: boolean;
  passengers: number;
}

export interface Hotel {
  id: string;
  name: string;
  area: string;
  city: string;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface BookingExtras {
  meetGreet: boolean;
  childSeat: boolean;
  extraStops: boolean;
  flightTracking: boolean;
}

export interface BookingDetails {
  vehicle: Vehicle;
  searchParams: SearchParams;
  extras: BookingExtras;
  flightNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}
