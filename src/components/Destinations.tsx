import { DESTINATIONS } from "../lib/data";
import { MapPin, Plane, ArrowRight } from "lucide-react";

interface DestinationsProps {
  onSelect: (destination: string) => void;
}

export function Destinations({ onSelect }: DestinationsProps) {
  const popular = DESTINATIONS.filter((d) => d.popular);
  const others = DESTINATIONS.filter((d) => !d.popular);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold tracking-wide uppercase mb-3">
            Global Coverage
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Popular Destinations Worldwide
          </h2>
          <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
            From Heathrow to Haneda, we've got you covered in 180+ countries and 900+ airports
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popular.map((dest) => (
            <button
              key={dest.id}
              onClick={() => onSelect(`${dest.airportCode} - ${dest.airportName}, ${dest.city}`)}
              className="group relative h-64 rounded-2xl overflow-hidden text-left shadow-md hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={dest.image}
                alt={dest.city}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Plane className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-400 tracking-wide">
                    {dest.airportCode}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{dest.city}</h3>
                <p className="text-sm text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {dest.airportName}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-sky-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Book a transfer
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Also Available In
          </h3>
          <div className="flex flex-wrap gap-2">
            {others.map((dest) => (
              <button
                key={dest.id}
                onClick={() => onSelect(`${dest.airportCode} - ${dest.airportName}, ${dest.city}`)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-700 text-sm font-medium transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                {dest.city}, {dest.country}
                <span className="text-xs text-slate-400">{dest.airportCode}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
