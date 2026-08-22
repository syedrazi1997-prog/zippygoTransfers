import { useEffect } from "react";
import { ArrowRight, Car, Check, Clock, Globe2, MapPin, Plane, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SeoAirport } from "../lib/seo";
import { airportSeoPath, SITE_URL, setPageSeo } from "../lib/seo";

interface Props {
  airport: SeoAirport;
}

export function SeoAirportPage({ airport }: Props) {
  const country = airport.countryName || airport.country || "Worldwide";
  const title = `${airport.name} Transfers | Airport Taxi & Private Transfers | ZippyGo`;
  const description = `Book airport transfers from ${airport.name} (${airport.code}) to hotels, city areas and destinations in ${airport.city}. Compare private and shared transfer options with ZippyGo.`;
  const canonical = `${SITE_URL}${airportSeoPath(airport)}`;

  useEffect(() => {
    setPageSeo({
      title,
      description,
      canonical,
      structuredData: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "ZippyGo",
          url: SITE_URL,
        },
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: `${airport.name} Airport Transfers`,
          serviceType: "Airport transfer",
          description,
          provider: { "@type": "Organization", name: "ZippyGo", url: SITE_URL },
          areaServed: [
            { "@type": "City", name: airport.city },
            { "@type": "Country", name: country },
          ],
          url: canonical,
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "ZippyGo", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Airport Transfers", item: `${SITE_URL}/airport-transfers/` },
            { "@type": "ListItem", position: 3, name: `${airport.name} Transfers`, item: canonical },
          ],
        },
      ],
    });
  }, [airport, canonical, country, description, title]);

  return (
    <div className="bg-slate-50 min-h-screen pt-20">
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
          <div className="flex items-center gap-2 text-sky-300 text-sm font-semibold mb-4">
            <Plane className="w-4 h-4" /> Airport Transfers Worldwide
          </div>
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{airport.name} Transfers</h1>
            <p className="mt-4 text-lg text-slate-300">Private and shared airport transfers from {airport.code} to hotels, neighbourhoods and destinations across {airport.city}.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><MapPin className="w-4 h-4" />{airport.city}, {country}</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><Globe2 className="w-4 h-4" />Global booking</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><Clock className="w-4 h-4" />Book in minutes</span>
            </div>
            <a href="/#book" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-6 py-3 font-bold transition-colors">Check transfer prices <ArrowRight className="w-4 h-4" /></a>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900">Airport transfers from {airport.name}</h2>
            <p className="mt-4 text-slate-600 leading-7">ZippyGo helps travellers arrange ground transport from {airport.name} to hotels, business districts and local areas in {airport.city}. Enter your travel date in the booking search to compare available vehicles and prices.</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-7">
              {([
                [ShieldCheck, "Upfront pricing", "See the booking price before payment."],
                [Car, "Multiple vehicle types", "Choose a vehicle that fits your group and luggage."],
                [Globe2, "Worldwide coverage", "Search airports and destinations across the world."],
                [Check, "Return transfers", "Add a return journey when you need one."],
              ] as [LucideIcon, string, string][]).map(([Icon, heading, text]) => (
                <div key={heading} className="rounded-xl bg-slate-50 p-4"><Icon className="w-5 h-5 text-sky-500" /><h3 className="mt-2 font-semibold text-slate-900">{heading}</h3><p className="mt-1 text-sm text-slate-600">{text}</p></div>
              ))}
            </div>
          </section>

          <aside className="bg-white rounded-2xl border border-slate-200 p-6 h-fit">
            <h2 className="text-lg font-bold text-slate-900">Popular searches</h2>
            <div className="mt-4 space-y-2">
              <a href="/airport-transfers/" className="block rounded-lg bg-slate-50 hover:bg-sky-50 px-4 py-3 text-sm font-medium text-slate-700">All airport transfers</a>
              <a href="/" className="block rounded-lg bg-slate-50 hover:bg-sky-50 px-4 py-3 text-sm font-medium text-slate-700">Book a transfer</a>
              <a href="/" className="block rounded-lg bg-slate-50 hover:bg-sky-50 px-4 py-3 text-sm font-medium text-slate-700">Travel guides & booking</a>
            </div>
          </aside>
        </div>

        <section className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">{airport.name} to {airport.city} transfer</h2>
          <p className="mt-3 text-slate-600 leading-7">Whether you are staying near the airport, in the city centre or in another local area, search ZippyGo for a transfer that matches your date, time, passenger count and vehicle preference.</p>
          <h3 className="text-lg font-bold text-slate-900 mt-7">How it works</h3>
          <ol className="mt-4 grid md:grid-cols-3 gap-4">
            <li className="rounded-xl border border-slate-200 p-4"><strong>1. Select {airport.code}</strong><p className="text-sm text-slate-600 mt-1">Choose {airport.name} in the airport search.</p></li>
            <li className="rounded-xl border border-slate-200 p-4"><strong>2. Choose your destination</strong><p className="text-sm text-slate-600 mt-1">Search for a hotel, area or destination.</p></li>
            <li className="rounded-xl border border-slate-200 p-4"><strong>3. Compare and book</strong><p className="text-sm text-slate-600 mt-1">Compare vehicle options and complete checkout.</p></li>
          </ol>
        </section>
      </main>
    </div>
  );
}

export function AirportTransfersIndexPage() {
  const title = "Airport Transfers Worldwide | ZippyGo";
  const description = "Book private and shared airport transfers worldwide. Search airports, hotels and areas, compare vehicles and arrange return transfers with ZippyGo.";
  const canonical = `${SITE_URL}/airport-transfers/`;

  useEffect(() => {
    setPageSeo({
      title,
      description,
      canonical,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "ZippyGo Airport Transfers",
        serviceType: "Airport transfer",
        provider: { "@type": "Organization", name: "ZippyGo", url: SITE_URL },
        areaServed: "Worldwide",
        url: canonical,
      },
    });
  }, []);

  const popular = [
    ["London Heathrow Airport", "LHR", "/airport-transfers/london-heathrow-airport-lhr/"],
    ["Dubai International Airport", "DXB", "/airport-transfers/dubai-international-airport-dxb/"],
    ["John F. Kennedy International Airport", "JFK", "/airport-transfers/john-f-kennedy-international-airport-jfk/"],
    ["Charles de Gaulle Airport", "CDG", "/airport-transfers/charles-de-gaulle-airport-cdg/"],
    ["Narita International Airport", "NRT", "/airport-transfers/narita-international-airport-nrt/"],
    ["Singapore Changi Airport", "SIN", "/airport-transfers/singapore-changi-airport-sin/"],
  ];

  return (
    <div className="bg-slate-50 min-h-screen pt-20">
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <span className="text-sky-300 text-sm font-semibold uppercase tracking-wider">ZippyGo Airport Transfers</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold">Airport Transfers Worldwide</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Find airport transfers from airports around the world to hotels, city centres and local areas. Compare private and shared options and add a return transfer when required.</p>
          <a href="/" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-6 py-3 font-bold">Book an airport transfer <ArrowRight className="w-4 h-4" /></a>
        </div>
      </section>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900">Popular airport transfer destinations</h2>
        <p className="mt-2 text-slate-600">Browse dedicated airport pages for popular international gateways.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {popular.map(([name, code, href]) => <a key={code} href={href} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-300 hover:shadow-md transition"><div className="text-xs font-bold text-sky-600">{code}</div><h3 className="mt-1 font-bold text-slate-900">{name} Transfers</h3><p className="mt-1 text-sm text-slate-500">Airport to hotel and city transfer options.</p></a>)}
        </div>
      </main>
    </div>
  );
}
