import type { Currency } from "./types";

// Rates are stored as USD -> currency and are used as a fallback when a live FX
// provider is not configured. Set VITE_FX_API_URL if you want to replace the
// fallback table with your own live-rate service.
export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", rateFromUSD: 1 },
  { code: "EUR", symbol: "€", name: "Euro", rateFromUSD: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rateFromUSD: 0.79 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", rateFromUSD: 0.88 },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", rateFromUSD: 3.65 },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", rateFromUSD: 22.8 },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", rateFromUSD: 365 },
  { code: "RON", symbol: "lei", name: "Romanian Leu", rateFromUSD: 4.55 },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", rateFromUSD: 1.80 },
  { code: "DKK", symbol: "kr", name: "Danish Krone", rateFromUSD: 6.55 },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", rateFromUSD: 9.45 },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", rateFromUSD: 10.15 },
  { code: "ISK", symbol: "kr", name: "Icelandic Krona", rateFromUSD: 122 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", rateFromUSD: 40.5 },
  { code: "RSD", symbol: "дин", name: "Serbian Dinar", rateFromUSD: 101 },
  { code: "ALL", symbol: "L", name: "Albanian Lek", rateFromUSD: 83 },
  { code: "MKD", symbol: "ден", name: "North Macedonian Denar", rateFromUSD: 56.5 },
  { code: "BAM", symbol: "KM", name: "Bosnia and Herzegovina Convertible Mark", rateFromUSD: 1.80 },
  { code: "MDL", symbol: "L", name: "Moldovan Leu", rateFromUSD: 17.2 },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", rateFromUSD: 41.5 },
  { code: "GEL", symbol: "₾", name: "Georgian Lari", rateFromUSD: 2.7 },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", rateFromUSD: 80 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rateFromUSD: 83.5 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", rateFromUSD: 3.67 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rateFromUSD: 1.52 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rateFromUSD: 1.36 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rateFromUSD: 157 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", rateFromUSD: 1.35 },
  { code: "THB", symbol: "฿", name: "Thai Baht", rateFromUSD: 36.5 },
  { code: "ZAR", symbol: "R", name: "South African Rand", rateFromUSD: 18.2 },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal", rateFromUSD: 3.64 },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", rateFromUSD: 3.75 },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", rateFromUSD: 48 },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham", rateFromUSD: 9.9 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", rateFromUSD: 5.5 },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", rateFromUSD: 18.5 },
  { code: "AMD", symbol: "֏", name: "Armenian Dram", rateFromUSD: 390 },
  { code: "AZN", symbol: "₼", name: "Azerbaijani Manat", rateFromUSD: 1.70 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", rateFromUSD: 1.65 },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", rateFromUSD: 4.35 },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", rateFromUSD: 16_000 },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", rateFromUSD: 57 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", rateFromUSD: 1_380 },
  { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar", rateFromUSD: 32.5 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rateFromUSD: 7.2 },
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

  const zeroDecimal = ["JPY", "KRW", "INR", "HUF", "ISK", "RSD", "ALL", "MKD", "IDR", "AMD"];
  if (zeroDecimal.includes(currencyCode)) {
    return `${symbol}${Math.round(converted).toLocaleString("en-US")}`;
  }

  return `${symbol}${converted.toFixed(2)}`;
}
