export type ServiceType = "transfer" | "car_hire" | "parking";

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
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
}

export interface Area {
  id: string;
  name: string;
  type: string;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  hotels: Hotel[];
  areas: Area[];
}
