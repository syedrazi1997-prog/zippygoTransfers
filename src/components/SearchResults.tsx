import type { SearchParams, Vehicle } from "../lib/types";
import { Users, Briefcase, DoorClosed, Check, Car, ArrowLeft } from "lucide-react";
import { VEHICLES, SHUTTLE_VEHICLE } from "../lib/data";
import { calculateVehiclePriceUSD } from "../lib/pricing";
import { formatPrice } from "../lib/currencies";

interface SearchResultsProps { searchParams: SearchParams; currency: string; onSelectVehicle: (vehicle: Vehicle) => void; onBack: () => void; }

export function SearchResults({ searchParams, currency, onSelectVehicle, onBack }: SearchResultsProps) {
  const vehicles = searchParams.serviceType === "transfer" ? [...VEHICLES, SHUTTLE_VEHICLE] : VEHICLES;

  return <div className="max-w-7xl mx-auto px-4 py-8">
    <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft className="w-4 h-4" /> Back to search</button>
    <div className="mb-8"><h2 className="text-2xl font-bold text-slate-900">Available rides from {searchParams.pickupAirportCode || searchParams.pickupLocation}</h2><p className="text-slate-500 text-sm mt-1">{searchParams.dropoffLocation ? `Transfer to ${searchParams.dropoffLocation}` : "Select your preferred vehicle option"}</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{vehicles.filter((vehicle) => !vehicle.transferOnly || searchParams.serviceType === "transfer").map((vehicle) => { const pricing = calculateVehiclePriceUSD(vehicle, searchParams); return <div key={vehicle.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="h-48 bg-slate-100 relative overflow-hidden"><img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" /><span className="absolute top-3 right-3 bg-slate-900/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full capitalize">{vehicle.transferMode === "shuttle" ? "Shuttle" : vehicle.class}</span></div>
      <div className="p-5 flex-1 flex flex-col justify-between"><div><h3 className="text-lg font-bold text-slate-900">{vehicle.name}</h3><p className="text-xs text-slate-500 mt-1 line-clamp-2">{vehicle.description}</p>
        <div className="flex items-center gap-4 my-4 text-slate-600 text-xs font-medium"><div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{vehicle.passengers}</div><div className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{vehicle.luggage}</div><div className="flex items-center gap-1"><DoorClosed className="w-3.5 h-3.5" />{vehicle.doors}</div></div>
        <ul className="space-y-1.5 mb-6">{vehicle.features.map((feature) => <li key={feature} className="flex items-center gap-2 text-xs text-slate-600"><Check className="w-3.5 h-3.5 text-emerald-500" />{feature}</li>)}</ul></div>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between"><div><span className="text-2xl font-extrabold text-slate-900">{formatPrice(pricing.totalUSD, currency)}</span><span className="text-xs text-slate-500 ml-1">total</span><div className="text-xs text-slate-500">{formatPrice(pricing.perPersonUSD, currency)} per passenger</div></div><button onClick={() => onSelectVehicle(vehicle)} className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"><Car className="w-3.5 h-3.5" /> Select Ride</button></div>
      </div></div>; })}</div>
  </div>;
}
