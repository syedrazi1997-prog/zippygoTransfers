import { useState, useMemo } from "react";
import {
  Plane,
  Car,
  ParkingCircle,
  MapPin,
  Calendar,
  Clock,
  Users,
  Search,
  Hotel,
} from "lucide-react";
import type { ServiceType, SearchParams } from "../lib/types";
import {
  getHotelsForAirport,
  getAreasForAirport,
  AIRPORT_DATALIST,
  getAirportFromLocation,
  getAirportByCode,
  getAirportsForCity,
} from "../lib/data";

interface SearchWidgetProps {
  onSearch: (params: SearchParams) => void;
  defaultService?: ServiceType;
}

export function SearchWidget({
  onSearch,
  defaultService = "transfer",
}: SearchWidgetProps) {
  const [serviceType, setServiceType] = useState<ServiceType>(defaultService);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("10:00");
  const [roundTrip, setRoundTrip] = useState(false);
  const [passengers, setPassengers] = useState(1);

  const selectedPickupAirport = useMemo(
    () => getAirportFromLocation(pickupLocation),
    [pickupLocation]
  );

  const availableHotels = useMemo(() => {
    return selectedPickupAirport
      ? getHotelsForAirport(selectedPickupAirport.code)
      : [];
  }, [selectedPickupAirport]);

  const availableAreas = useMemo(() => {
    return selectedPickupAirport
      ? getAreasForAirport(selectedPickupAirport.code)
      : [];
  }, [selectedPickupAirport]);

  const arrivalAirport = useMemo(() => {
    if (!dropoffLocation) return undefined;
    const directAirport = getAirportFromLocation(dropoffLocation);
    if (directAirport) return directAirport;

    const hotelMatch = availableHotels.find(
      (h) => `${h.name}, ${h.address}`.toLowerCase() === dropoffLocation.trim().toLowerCase()
    );
    if (hotelMatch && selectedPickupAirport) return selectedPickupAirport;

    return getAirportsForCity(dropoffLocation.trim())[0];
  }, [dropoffLocation, availableHotels, selectedPickupAirport]);

  const handleSubmit = () => {
    const airport =
      selectedPickupAirport || getAirportByCode(pickupLocation.trim().toUpperCase());
    if (!airport) return;

    const location = `${airport.code} - ${airport.name}, ${airport.city}`;

    onSearch({
      serviceType,
      pickupLocation: location,
      dropoffLocation: serviceType === "transfer" ? dropoffLocation : "",
      pickupDate,
      pickupTime,
      returnDate: roundTrip || serviceType !== "transfer" ? returnDate : "",
      returnTime: roundTrip ? returnTime : "",
      roundTrip,
      passengers: Math.max(1, passengers),
      pickupAirportCode: airport.code,
      arrivalAirportCode: arrivalAirport?.code || airport.code,
      destinationCity: arrivalAirport?.city || airport.city,
      destinationCountry: arrivalAirport?.country || airport.country,
    });
  };

  const canSubmit =
    !!selectedPickupAirport &&
    !!pickupDate &&
    (serviceType !== "transfer" || !!dropoffLocation);

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
      <div className="flex gap-2 mb-6 border-b border-slate-100 pb-4">
        {[
          { type: "transfer", label: "Airport Transfers", icon: Plane },
          { type: "car_hire", label: "Car Hire", icon: Car },
          { type: "parking", label: "Airport Parking", icon: ParkingCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = serviceType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setServiceType(tab.type as ServiceType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Pickup Airport Code / City
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              list="airports-list"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="e.g. LHR, DXB, JFK, CDG"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-medium"
            />
            <datalist id="airports-list">
              {AIRPORT_DATALIST.map((ap) => (
                <option key={ap.code} value={`(${ap.code}) ${ap.name}`}>
                  {ap.city}, {ap.country}
                </option>
              ))}
            </datalist>
          </div>
        </div>

        {serviceType === "transfer" && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Drop-off Area / Hotel
            </label>
            <div className="relative">
              <Hotel className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                list="dropoff-options"
                disabled={!selectedPickupAirport}
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                placeholder={
                  selectedPickupAirport
                    ? `Hotels or areas in ${selectedPickupAirport.city}`
                    : "Select pickup airport first"
                }
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <datalist id="dropoff-options">
                {availableHotels.map((h) => (
                  <option key={h.id} value={`${h.name}, ${h.address}`}>
                    Hotel in {selectedPickupAirport?.city}
                  </option>
                ))}
                {availableAreas.map((a) => (
                  <option key={a.id} value={`${a.name}, ${selectedPickupAirport?.city}`}>
                    Area ({a.type})
                  </option>
                ))}
              </datalist>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Pickup Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Time
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase">Passengers:</span>
          <select
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 text-sm font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:border-sky-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "Passenger" : "Passengers"}
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
            canSubmit
              ? "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/25"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Search className="w-4 h-4" />
          Search Rides
        </button>
      </div>
    </div>
  );
}
