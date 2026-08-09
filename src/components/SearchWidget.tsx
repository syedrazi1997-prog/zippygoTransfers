import { useState, useMemo } from "react";
import { Plane, Car, ParkingCircle, MapPin, Calendar, Clock, Users, Search, ArrowRight, ChevronRight, Hotel, Repeat, ArrowLeftRight } from "lucide-react";
import type { ServiceType, SearchParams } from "../lib/types";
import { getHotelsForAirport, AIRPORT_DATALIST, getAirportFromLocation, getAirportByCode, getAirportsForCity } from "../lib/data";

interface SearchWidgetProps {
  onSearch: (params: SearchParams) => void;
  defaultService?: ServiceType;
}

export function SearchWidget({ onSearch, defaultService = "transfer" }: SearchWidgetProps) {
  const [serviceType, setServiceType] = useState<ServiceType>(defaultService);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("10:00");
  const [roundTrip, setRoundTrip] = useState(false);
  const [passengers, setPassengers] = useState(1);

  const tabs: { type: ServiceType; label: string; icon: typeof Plane; desc: string }[] = [
    { type: "transfer", label: "Airport Transfers", icon: Plane, desc: "Door-to-door airport rides" },
    { type: "car_hire", label: "Car Hire", icon: Car, desc: "Self-drive rental cars" },
    { type: "parking", label: "Airport Parking", icon: ParkingCircle, desc: "Secure airport parking" },
  ];

  const selectedPickupAirport = useMemo(
    () => getAirportFromLocation(pickupLocation),
    [pickupLocation]
  );

  const hotels = useMemo(() => {
    return getHotelsForAirport(selectedPickupAirport?.code || "");
  }, [selectedPickupAirport]);

  const arrivalAirport = useMemo(() => {
    if (!dropoffLocation) return undefined;

    // If the customer enters an airport/IATA code, use that exact airport.
    const directAirport = getAirportFromLocation(dropoffLocation);
    if (directAirport) return directAirport;

    // Otherwise resolve a selected hotel to its destination city.
    const hotelMatch = hotels.find((hotel) =>
      `${hotel.name}, ${hotel.area}`.toLowerCase() === dropoffLocation.trim().toLowerCase()
    );
    if (hotelMatch) return getAirportsForCity(hotelMatch.city)[0];

    // Finally, allow a city name as the destination.
    return getAirportsForCity(dropoffLocation.trim())[0];
  }, [dropoffLocation, hotels]);

  const handleSubmit = () => {
    const airport = selectedPickupAirport || getAirportByCode(pickupLocation.trim().toUpperCase());
    if (!airport) return;

    const location = serviceType === "parking" ? airport.code + " - " + airport.name + ", " + airport.city :
      airport.code + " - " + airport.name + ", " + airport.city;

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

  const canSubmit = !!selectedPickupAirport && !!pickupDate && (serviceType !== "transfer" || !!dropoffLocation);

  return (
    <div className="w-full">
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setServiceType(tab.type)}
            className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              serviceType === tab.type
                ? "bg-white text-slate-900 shadow-lg"
                : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
        <p className="text-sm text-slate-500 mb-4 flex items-center gap-2">
          {tabs.find((t) => t.type === serviceType)?.icon && (
            <span className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              {(() => {
                const TabIcon = tabs.find((t) => t.type === serviceType)!.icon;
                return <TabIcon className="w-4 h-4 text-sky-600" />;
              })()}
            </span>
          )}
          {tabs.find((t) => t.type === serviceType)?.desc}
        </p>

        {serviceType === "transfer" && (
          <div className="mb-4 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`relative w-11 h-6 rounded-full transition-colors ${roundTrip ? "bg-sky-500" : "bg-slate-300"}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${roundTrip ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-slate-400" />
                Round trip (Both ways)
              </span>
              <input type="checkbox" checked={roundTrip} onChange={() => setRoundTrip(!roundTrip)} className="sr-only" />
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceType === "transfer" && (
            <>
              <Field label="Arrival / Pickup Airport" icon={Plane}>
                <input
                  list="airport-list"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Select airport (IATA / city / name)"
                  className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
                />
              </Field>
              <Field label="To (Hotel / Destination)" icon={Hotel}>
                <input
                  list="hotel-list"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder={hotels.length > 0 ? "Select hotel or enter address" : "Enter destination"}
                  className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
                />
              </Field>
              {selectedPickupAirport && (
                <div className="sm:col-span-2 lg:col-span-4 -mt-2 px-1 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Pickup location:</span> {selectedPickupAirport.name}, {selectedPickupAirport.city} ({selectedPickupAirport.code})
                  {arrivalAirport && (
                    <> · <span className="font-medium text-slate-700">Destination airport:</span> {arrivalAirport.name} ({arrivalAirport.code})</>
                  )}
                </div>
              )}
            </>
          )}

          {serviceType === "car_hire" && (
            <Field label="Pick-up Location (Airport)" icon={MapPin}>
              <input
                list="airport-list"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="City or airport"
                className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
              />
            </Field>
          )}

          {serviceType === "parking" && (
            <Field label="Airport / Pickup Location" icon={Plane}>
              <input
                list="airport-list"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Select airport"
                className="w-full bg-transparent outline-none text-slate-900 placeholder-slate-400 text-sm"
              />
            </Field>
          )}

          <Field label={serviceType === "car_hire" ? "Pick-up Date" : "Pick-up Date"} icon={Calendar}>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-900 text-sm"
            />
          </Field>

          {serviceType === "car_hire" || serviceType === "parking" ? (
            <Field label="Return Date" icon={Calendar}>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-900 text-sm"
              />
            </Field>
          ) : (
            <Field label="Pick-up Time" icon={Clock}>
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-900 text-sm"
              />
            </Field>
          )}

          <Field label="Adults" icon={Users}>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full bg-transparent outline-none text-slate-900 text-sm cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "adult" : "adults"}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {serviceType === "transfer" && roundTrip && (
          <div className="mt-4 p-4 rounded-xl bg-sky-50 border border-sky-200">
            <div className="flex items-center gap-2 mb-3">
              <ArrowLeftRight className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-sky-800">Return Trip Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Return Date" icon={Calendar}>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-900 text-sm"
                />
              </Field>
              <Field label="Return Time" icon={Clock}>
                <input
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-900 text-sm"
                />
              </Field>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full mt-5 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-sky-500/30 disabled:shadow-none group"
        >
          <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Search {tabs.find((t) => t.type === serviceType)?.label}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        {!canSubmit && (
          <p className="text-xs text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
            <ChevronRight className="w-3 h-3" />
            Please fill in all required fields
          </p>
        )}
      </div>

      <datalist id="airport-list">
        {AIRPORT_DATALIST.map((a) => (
          <option key={a.code} value={a.value}>
            {a.label}
          </option>
        ))}
      </datalist>

      <datalist id="hotel-list">
        {hotels.map((h) => (
          <option key={h.id} value={`${h.name}, ${h.area}`} />
        ))}
      </datalist>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5 hover:border-sky-300 transition-colors group">
      <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        {label}
      </label>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
