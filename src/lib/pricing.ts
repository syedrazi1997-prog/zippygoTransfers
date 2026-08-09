import type { SearchParams, Vehicle } from "./types";

export const PRICE_MARGIN = 1.05;
export const INCLUDED_ADULTS = 2;

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
 * Supplier/base prices are treated as the quoted price for 2 adults.
 * Any adult above 2 is charged at the same per-person rate (base / 2).
 * The 5% ZippyGo margin is applied once to the supplier/base quote.
 */
export function calculateVehiclePriceUSD(
  vehicle: Vehicle,
  searchParams: SearchParams
): { totalUSD: number; baseForTwoAdultsUSD: number; extraAdultUSD: number; unit: string } {
  const days = getDurationDays(searchParams);
  const adults = Math.max(searchParams.passengers, INCLUDED_ADULTS);

  let baseForTwoAdultsUSD: number;

  if (searchParams.serviceType === "transfer") {
    const oneWayForTwo = vehicle.basePriceUSD * vehicle.transferMultiplier * PRICE_MARGIN;
    baseForTwoAdultsUSD = searchParams.roundTrip ? oneWayForTwo * 2 : oneWayForTwo;
  } else if (searchParams.serviceType === "car_hire") {
    baseForTwoAdultsUSD =
      vehicle.basePriceUSD * vehicle.carHireDailyMultiplier * PRICE_MARGIN * days;
  } else {
    baseForTwoAdultsUSD = vehicle.parkingDailyUSD * PRICE_MARGIN * days;
  }

  const extraAdultUSD = baseForTwoAdultsUSD / INCLUDED_ADULTS;
  const totalUSD = baseForTwoAdultsUSD + Math.max(adults - INCLUDED_ADULTS, 0) * extraAdultUSD;

  const unit =
    searchParams.serviceType === "transfer"
      ? searchParams.roundTrip
        ? `${adults} adults · return trip`
        : `${adults} adults · one way`
      : `${adults} adults · ${days} day${days > 1 ? "s" : ""}`;

  return { totalUSD, baseForTwoAdultsUSD, extraAdultUSD, unit };
}
