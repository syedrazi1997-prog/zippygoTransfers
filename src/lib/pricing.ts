import type { SearchParams, Vehicle } from "./types";

export const PRICE_MARGIN = 1.05;

export interface VehiclePricing {
  /** Customer-facing transfer price for one passenger, before passenger multiplication. */
  perPersonUSD: number;
  /** Total price for the booking in USD, including passengers where applicable. */
  totalUSD: number;
  /** Supplier quote after the 5% margin, for one passenger (transfer) or the full rental/parking duration (hire/parking). */
  supplierPerPersonUSD: number;
  passengerCount: number;
  days: number;
  /** Customer-facing daily rate for car hire/parking. Undefined for transfers. */
  dailyRateUSD?: number;
  /** Whether the price is charged per passenger rather than per vehicle/booking. */
  isPerPerson: boolean;
  unit: string;
}

/**
 * Returns the billable duration in whole days.
 *
 * Car hire and airport parking are charged for the complete period between
 * pickup/entry and return/exit. Partial days are rounded up, with a minimum
 * of one day.
 */
export function getDurationDays(searchParams: SearchParams): number {
  if (!searchParams.roundTrip || !searchParams.returnDate || !searchParams.pickupDate) return 1;

  const pickup = new Date(`${searchParams.pickupDate}T${searchParams.pickupTime || "00:00"}`);
  const returned = new Date(`${searchParams.returnDate}T${searchParams.returnTime || "23:59"}`);

  if (!Number.isNaN(pickup.getTime()) && !Number.isNaN(returned.getTime()) && returned.getTime() >= pickup.getTime()) {
    const durationHours = (returned.getTime() - pickup.getTime()) / (1000 * 60 * 60);
    return Math.max(1, Math.ceil(durationHours / 24));
  }

  const diff = Math.ceil(
    (new Date(searchParams.returnDate).getTime() - new Date(searchParams.pickupDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return Math.max(diff, 1);
}

export function calculateVehiclePriceUSD(
  vehicle: Vehicle,
  searchParams: SearchParams
): VehiclePricing {
  const passengerCount = Math.max(1, Math.floor(Number(searchParams.passengers) || 1));
  const days = getDurationDays(searchParams);

  if (searchParams.serviceType === "transfer") {
    let supplierPerPersonUSD = vehicle.basePriceUSD * vehicle.transferMultiplier;
    const transferMode = vehicle.transferMode || searchParams.transferMode || "private";
    if (transferMode === "shuttle") supplierPerPersonUSD *= 0.82;
    if (searchParams.roundTrip) supplierPerPersonUSD *= 2;

    const perPersonUSD = supplierPerPersonUSD * PRICE_MARGIN;
    const totalUSD = perPersonUSD * passengerCount;

    return {
      perPersonUSD,
      totalUSD,
      supplierPerPersonUSD,
      passengerCount,
      days,
      isPerPerson: true,
      unit: `${transferMode === "shuttle" ? "shared shuttle" : "private transfer"} · ${searchParams.roundTrip ? "return trip" : "one way"} · ${passengerCount} passenger${passengerCount === 1 ? "" : "s"}`,
    };
  }

  // Car hire and airport parking are priced per vehicle/booking, not per passenger.
  // The return/exit date and time determine the number of billable days.
  const rawDailyUSD =
    searchParams.serviceType === "car_hire"
      ? vehicle.carHireDailyMultiplier
      : vehicle.parkingDailyUSD;
  const dailyRateUSD = rawDailyUSD * PRICE_MARGIN;
  const totalUSD = dailyRateUSD * days;

  return {
    perPersonUSD: totalUSD,
    totalUSD,
    supplierPerPersonUSD: rawDailyUSD * days,
    passengerCount,
    days,
    dailyRateUSD,
    isPerPerson: false,
    unit: `${searchParams.serviceType === "car_hire" ? "car hire" : "airport parking"} · ${days} day${days === 1 ? "" : "s"}`,
  };
}
