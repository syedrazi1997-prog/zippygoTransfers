import { SearchParams, Vehicle } from "../lib/types";
import { Users, Briefcase, DoorClosed, Check, Car } from "lucide-react";

interface SearchResultsProps {
  searchParams: SearchParams;
  vehicles: Vehicle[];
  onSelectVehicle: (vehicle: Vehicle) => void;
}

export function SearchResults({
  searchParams,
  vehicles,
  onSelectVehicle,
}: SearchResultsProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Available Rides for {searchParams.pickupAirportCode || searchParams.pickupLocation}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {searchParams.dropoffLocation
            ? `Transfer to ${searchParams.dropoffLocation}`
            : "Select your preferred vehicle option"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => {
          const price =
            searchParams.serviceType === "car_hire"
              ? vehicle.carHireDailyMultiplier
              : searchParams.serviceType === "parking"
              ? vehicle.parkingDailyUSD
              : Math.round(vehicle.basePriceUSD * vehicle.transferMultiplier);

          return (
            <div
              key={vehicle.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm capitalize">
                  {vehicle.class}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{vehicle.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {vehicle.description}
                  </p>

                  <div className="flex items-center gap-4 my-4 text-slate-600 text-xs font-medium">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{vehicle.passengers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>{vehicle.luggage}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DoorClosed className="w-3.5 h-3.5" />
                      <span>{vehicle.doors}</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 mb-6">
                    {vehicle.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900">${price}</span>
                    <span className="text-xs text-slate-500 ml-1">
                      {searchParams.serviceType === "car_hire"
                        ? "/day"
                        : searchParams.serviceType === "parking"
                        ? "/day"
                        : "total"}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectVehicle({ ...vehicle, priceUSD: price })}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Car className="w-3.5 h-3.5" />
                    Select Ride
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
