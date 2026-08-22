export interface SeoAirport {
  code: string;
  name: string;
  city: string;
  country: string;
  countryName?: string;
  latitude?: number;
  longitude?: number;
}

declare global {
  interface Window {
    __ZIPPYGO_SEO_AIRPORT__?: SeoAirport;
  }
}

export const SITE_URL = String(import.meta.env.VITE_SITE_URL || "https://zippygotransfers.com").replace(/\/+$/, "");

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function airportSeoSlug(airport: Pick<SeoAirport, "name" | "code">): string {
  return `${slugify(airport.name)}-${airport.code.toLowerCase()}`;
}

export function airportSeoPath(airport: Pick<SeoAirport, "name" | "code">): string {
  return `/airport-transfers/${airportSeoSlug(airport)}/`;
}

export function getAirportSeoFromPath(pathname = window.location.pathname): SeoAirport | null {
  if (!pathname.startsWith("/airport-transfers/")) return null;
  const slug = pathname.replace(/^\/airport-transfers\//, "").replace(/\/$/, "");
  if (!slug || slug.includes("/")) return null;

  const embedded = window.__ZIPPYGO_SEO_AIRPORT__;
  if (embedded && airportSeoSlug(embedded) === slug) return embedded;

  return null;
}

export function setPageSeo(options: {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}) {
  document.title = options.title;

  const upsertMeta = (name: string, content: string, property = false) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let element = document.head.querySelector(selector) as HTMLMetaElement | null;
    if (!element) {
      element = document.createElement("meta");
      if (property) element.setAttribute("property", name);
      else element.setAttribute("name", name);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  };

  upsertMeta("description", options.description);
  upsertMeta("robots", options.robots || "index,follow");
  upsertMeta("og:title", options.title, true);
  upsertMeta("og:description", options.description, true);
  upsertMeta("og:url", options.canonical, true);
  upsertMeta("twitter:title", options.title);
  upsertMeta("twitter:description", options.description);

  let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = options.canonical;

  document.head.querySelectorAll('script[data-zippygo-structured-data="true"]').forEach((node) => node.remove());
  const data = Array.isArray(options.structuredData) ? options.structuredData : [options.structuredData].filter(Boolean);
  data.forEach((item) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.zippygoStructuredData = "true";
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
}
