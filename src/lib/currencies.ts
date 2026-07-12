import type { Currency } from "./types";

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rateFromUSD: 1 },
  { code: "EUR", symbol: "€", name: "Euro", rateFromUSD: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rateFromUSD: 0.79 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rateFromUSD: 83.5 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", rateFromUSD: 3.67 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rateFromUSD: 1.52 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rateFromUSD: 1.36 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rateFromUSD: 157 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rateFromUSD: 1.35 },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", rateFromUSD: 0.88 },
  { code: "THB", symbol: "฿", name: "Thai Baht", rateFromUSD: 36.5 },
  { code: "ZAR", symbol: "R", name: "South African Rand", rateFromUSD: 18.2 },
];

export function convertFromUSD(amountUSD: number, currencyCode: string): number {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  if (!currency) return amountUSD;
  return amountUSD * currency.rateFromUSD;
}

export function formatPrice(amountUSD: number, currencyCode: string): string {
  const converted = convertFromUSD(amountUSD, currencyCode);
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currency ? currency.symbol : "$";

  if (currencyCode === "JPY" || currencyCode === "INR") {
    return `${symbol}${Math.round(converted).toLocaleString("en-US")}`;
  }

  return `${symbol}${converted.toFixed(2)}`;
}
