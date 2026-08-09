import { useState, useMemo } from "react";
import { Users, Briefcase, Check, ArrowLeft, Star, Filter, Zap } from "lucide-react";
import type { Vehicle, SearchParams, ServiceType } from "../lib/types";
import { VEHICLES, getAirportByCode } from "../lib/data";
import { calculateVehiclePriceUSD } from "../lib/pricing";
import { formatPrice, CURRENCIES } from "../lib/currencies";

interface SearchResultsProps {
  searchParams: SearchParams;
  currency: string;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onBack: () => void;
}

export function SearchResults({ searchParams, currency, onSelectVehicle, onBack }: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<"price" | "capacity">("price");

  const vehiclesWithPricing = useMemo(() => {
    return VEHICLES.map((v) => {
      const pricing = calculateVehiclePriceUSD(v, searchParams);
      return {
        ...v,
        priceUSD: pricing.totalUSD,
        baseForTwoAdultsUSD: pricing.baseForTwoAdultsUSD,
        extraAdultUSD: pricing.extraAdultUSD,
        unit: pricing.unit,
      };
    });
  }, [searchParams]);

  const filteredVehicles = useMemo(() => {
    let result = vehiclesWithPricing.filter(
      (v) => v.passengers >= searchParams.passengers
    );

    if (sortBy === "price") {
      result = [...result].sort((a, b) => a.priceUSD - b.priceUSD);
    } else {
      result = [...result].sort((a, b) => b.passengers - a.passengers);
    }

    return result;
  }, [vehiclesWithPricing, searchParams.passengers, sortBy]);

  const serviceLabel: Record<ServiceType, string> = {
    transfer: "Airport Transfer",
    car_hire: "Car Hire",
    parking: "Airport Parking",
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Modify Search
              </button>
              <div className="hidden sm:block w-px h-6 bg-slate-200" />
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-700 font-medium text-xs">
                  {serviceLabel[searchParams.serviceType]}
                </span>
                <span className="text-slate-600">
                  {searchParams.pickupLocation}
                  {searchParams.arrivalAirportCode && (
                    <span className="ml-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">
                      {getAirportByCode(searchParams.arrivalAirportCode)?.code || searchParams.arrivalAirportCode}
                    </span>
                  )}
                  {searchParams.dropoffLocation && (
                    <>
                      <span className="mx-1.5 text-slate-400">→</span>
                      {searchParams.dropoffLocation}
                    </>
                  )}
                </span>
                {searchParams.roundTrip && (
                  <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 font-medium text-xs">
                    Round Trip
                  </span>
                )}
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">
                  {searchParams.pickupDate}
                  {searchParams.returnDate && ` → ${searchParams.returnDate}`}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600">
                  {searchParams.passengers} adults
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "price" | "capacity")}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none cursor-pointer hover:border-slate-300"
              >
                <option value="price">Sort by Price</option>
                <option value="capacity">Sort by Capacity</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            {filteredVehicles.length} options available
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Prices are for 2 adults as the base quote; each additional adult is charged at the per-person rate. A 5% service margin is included.
          </p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-100 text-xs font-medium text-sky-700">
            Prices shown in {CURRENCIES.find((c) => c.code === currency)?.name || currency} ({currency}) based on your selected destination
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              currency={currency}
              onSelect={() => onSelectVehicle(vehicle)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function VehicleCard({
  vehicle,
  currency,
  onSelect,
}: {
  vehicle: Vehicle & { priceUSD: number; baseForTwoAdultsUSD: number; extraAdultUSD: number; unit: string };
  currency: string;
  onSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-sky-200 transition-all duration-300 group">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-2/5 relative overflow-hidden bg-slate-100">
          {!imgError ? (
            <img
              src={vehicle.image}
              alt={vehicle.name}
              onError={() => setImgError(true)}
              className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-48 sm:h-full flex items-center justify-center bg-slate-200">
              <Zap className="w-12 h-12 text-slate-400" />
            </div>
          )}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-700 capitalize">
            {vehicle.class}
          </div>
        </div>

        <div className="sm:w-3/5 p-5 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{vehicle.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                <span className="text-xs text-slate-500">Premium class</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-2 line-clamp-2">{vehicle.description}</p>

          <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              {vehicle.passengers}
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              {vehicle.luggage}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {vehicle.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-xs text-slate-600"
              >
                <Check className="w-3 h-3 text-green-500" />
                {f}
              </span>
            ))}
            {vehicle.features.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-slate-400">
                +{vehicle.features.length - 3} more
              </span>
            )}
          </div>

          <div className="flex items-end justify-between mt-auto pt-4">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {formatPrice(vehicle.priceUSD, currency)}
              </p>
              <p className="text-xs text-slate-400">{vehicle.unit}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Base for 2 adults: {formatPrice(vehicle.baseForTwoAdultsUSD, currency)} · Extra adult: {formatPrice(vehicle.extraAdultUSD, currency)}
              </p>
            </div>
            <button
              onClick={onSelect}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-sm font-semibold transition-all shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
