import type { SearchParams, Vehicle } from "./types";

export const PRICE_MARGIN = 1.05;

export interface VehiclePricing {
  /** Customer-facing price for exactly one passenger, before any extras. */
  perPersonUSD: number;
  /** Total customer-facing price for the booking. Transfers are per passenger; car hire and parking are per vehicle. */
  totalUSD: number;
  /** Supplier quote after the 5% margin, for one passenger. */
  supplierPerPersonUSD: number;
  passengerCount: number;
  days: number;
  unit: string;
}

export function getDurationDays(searchParams: SearchParams): number {
  if (searchParams.returnDate && searchParams.pickupDate) {
    const diff = Math.ceil(
      (new Date(searchParams.returnDate).getTime() -
        new Date(searchParams.pickupDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.max(diff, 1);
  }
  return 1;
}

/**
 * Pricing is strictly per passenger.
 *
 * The supplier/base vehicle rate is treated as a one-passenger rate. The
 * ZippyGo 5% margin is applied once to that rate, then the result is
 * multiplied by the exact number of passengers selected by the customer.
 * No minimum of two passengers is applied.
 */
export function calculateVehiclePriceUSD(
  vehicle: Vehicle,
  searchParams: SearchParams
): VehiclePricing {
  const passengerCount = Math.max(1, Math.floor(Number(searchParams.passengers) || 1));
  const days = getDurationDays(searchParams);

  let supplierPerPersonUSD: number;

  if (searchParams.serviceType === "transfer") {
    supplierPerPersonUSD = vehicle.basePriceUSD * vehicle.transferMultiplier;
    if (searchParams.roundTrip) supplierPerPersonUSD *= 2;
  } else if (searchParams.serviceType === "car_hire") {
    supplierPerPersonUSD = vehicle.basePriceUSD * vehicle.carHireDailyMultiplier * days;
  } else {
    supplierPerPersonUSD = vehicle.parkingDailyUSD * days;
  }

  const perPersonUSD = supplierPerPersonUSD * PRICE_MARGIN;
  const isTransfer = searchParams.serviceType === "transfer";
  const totalUSD = isTransfer ? perPersonUSD * passengerCount : perPersonUSD;

  const unit = isTransfer
    ? searchParams.roundTrip
      ? `per person · return trip · ${passengerCount} passenger${passengerCount === 1 ? "" : "s"}`
      : `per person · one way · ${passengerCount} passenger${passengerCount === 1 ? "" : "s"}`
    : searchParams.serviceType === "car_hire"
      ? `per vehicle · ${days} day${days > 1 ? "s" : ""}`
      : `per vehicle · ${days} day${days > 1 ? "s" : ""}`;

  return {
    perPersonUSD,
    totalUSD,
    supplierPerPersonUSD,
    passengerCount,
    days,
    unit,
  };
}
