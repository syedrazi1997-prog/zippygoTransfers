import { useState, useMemo } from "react";
import { ArrowLeft, Users, Briefcase, Check } from "lucide-react";
import type { SearchParams, Vehicle, ServiceType } from "../lib/types";
import { VEHICLES } from "../lib/data";

interface SearchResultsProps {
  searchParams: SearchParams;
  onBack: () => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function SearchResults({
  searchParams,
  onBack,
  onSelectVehicle,
}: SearchResultsProps) {
  const [sortBy, setSortBy] = useState<"price" | "passengers">("price");

  const vehiclesWithPricing = useMemo(() => {
    return VEHICLES.map((v) => {
      let price = v.basePriceUSD;
      if (searchParams.serviceType === "transfer") {
        price = v.basePriceUSD * v.transferMultiplier;
      } else if (searchParams.serviceType === "car_hire") {
        price = v.basePriceUSD * v.carHireDailyMultiplier;
      } else if (searchParams.serviceType === "parking") {
        price = v.parkingDailyUSD;
      }
      return { ...v, priceUSD: price };
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
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Modify Search
          </button>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-700 font-medium">
              {serviceLabel[searchParams.serviceType]}
            </span>
            <span>•</span>
            <span>{searchParams.pickupLocation}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Available Options ({filteredVehicles.length})
          </h2>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span>Sort by:</span>
            <button
              onClick={() => setSortBy("price")}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                sortBy === "price"
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              Price
            </button>
            <button
              onClick={() => setSortBy("passengers")}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                sortBy === "passengers"
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              Capacity
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-48 h-32 object-cover rounded-xl"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{vehicle.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{vehicle.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {vehicle.passengers} Passengers
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {vehicle.luggage} Bags
                    </span>
                  </div>
                  {vehicle.features && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {vehicle.features.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                        >
                          <Check className="w-3 h-3 text-sky-500" />
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-2xl font-extrabold text-slate-900">
                    ${vehicle.priceUSD}
                  </span>
                  <span className="text-xs text-slate-500 block">Total estimate</span>
                </div>
                <button
                  onClick={() => onSelectVehicle(vehicle)}
                  className="mt-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-xl shadow-md transition-all"
                >
                  Select Vehicle
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
