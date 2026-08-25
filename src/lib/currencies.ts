import type { Currency } from "./types";

// ZippyGo accepts and displays INR only. Prices in the pricing engine remain
// in USD as the internal base currency; this module performs the single
// USD -> INR conversion used everywhere in the customer-facing UI and checkout.
export const CURRENCIES: Currency[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", rateFromUSD: 83.5 },
];

export const DEFAULT_CURRENCY = "INR";

export function convertFromUSD(amountUSD: number, currencyCode = DEFAULT_CURRENCY): number {
  return amountUSD * 83.5;
}

export function formatPrice(amountUSD: number, _currencyCode = DEFAULT_CURRENCY): string {
  return `₹${Math.round(convertFromUSD(amountUSD, DEFAULT_CURRENCY)).toLocaleString("en-IN")}`;
}
