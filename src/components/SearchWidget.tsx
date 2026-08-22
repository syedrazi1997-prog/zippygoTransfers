import { useEffect, useMemo, useRef, useState } from "react";
import { Plane, Car, ParkingCircle, MapPin, Calendar, Clock, Users, Search, Hotel, Repeat2, ChevronDown } from "lucide-react";
import type { ServiceType, SearchParams } from "../lib/types";
import { getAirportFromLocation, getAirportByCode, getHotelsForAirport, getAreasForAirport, searchAirportsRemote, getAirportDestinationsRemote, type RemoteAirportOption } from "../lib/data";

interface SearchWidgetProps { onSearch: (params: SearchParams) => void; defaultService?: ServiceType; }

export function SearchWidget({ onSearch, defaultService = "transfer" }: SearchWidgetProps) {
  const [serviceType, setServiceType] = useState<ServiceType>(defaultService);
  const [roundTrip, setRoundTrip] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("18:00");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [passengers, setPassengers] = useState(1);
  const [airportOptions, setAirportOptions] = useState<RemoteAirportOption[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<RemoteAirportOption | undefined>();
  const [hotels, setHotels] = useState<{ id: string; name: string; address: string }[]>([]);
  const [areas, setAreas] = useState<{ id: string; name: string; type: string }[]>([]);
  const [loadingAirports, setLoadingAirports] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const airportSelectionRef = useRef(false);

  const fallbackAirport = useMemo(() => getAirportFromLocation(pickupLocation) || getAirportByCode(pickupLocation.trim().toUpperCase()), [pickupLocation]);

  useEffect(() => {
    if (airportSelectionRef.current) {
      airportSelectionRef.current = false;
      return;
    }
    setSelectedAirport(undefined); setDropoffLocation(""); setHotels([]); setAreas([]);
    const query = pickupLocation.trim();
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (!query) { setAirportOptions([]); return; }
    if (fallbackAirport) setAirportOptions([{ ...fallbackAirport, latitude: 0, longitude: 0 }]);
    searchTimer.current = setTimeout(async () => {
      setLoadingAirports(true);
      try {
        const remote = await searchAirportsRemote(query);
        setAirportOptions(remote.length ? remote : fallbackAirport ? [{ ...fallbackAirport, latitude: 0, longitude: 0 }] : []);
      } catch (error) {
        console.warn("Global airport search unavailable; using local fallback.", error);
        setAirportOptions(fallbackAirport ? [{ ...fallbackAirport, latitude: 0, longitude: 0 }] : []);
      } finally { setLoadingAirports(false); }
    }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [pickupLocation, fallbackAirport]);

  async function chooseAirport(airport: RemoteAirportOption) {
    airportSelectionRef.current = true;
    setSelectedAirport(airport); setPickupLocation(`${airport.code} — ${airport.name}`); setAirportOptions([]); setDropoffLocation("");
    setLoadingDestinations(true);
    try {
      if (airport.latitude && airport.longitude) {
        const result = await getAirportDestinationsRemote(airport);
        setHotels(result.hotels); setAreas(result.areas);
      } else { setHotels(getHotelsForAirport(airport.code)); setAreas(getAreasForAirport(airport.code)); }
    } catch (error) {
      console.warn("Nearby destination lookup failed; using local fallback.", error);
      setHotels(getHotelsForAirport(airport.code)); setAreas(getAreasForAirport(airport.code));
    } finally { setLoadingDestinations(false); }
  }

  const isTransfer = serviceType === "transfer";
  const canSubmit = !!selectedAirport && !!pickupDate && (!isTransfer || !!dropoffLocation) &&
    (!roundTrip || (!!returnDate && !!returnTime));

  function handleSubmit() {
    if (!selectedAirport || !canSubmit) return;
    onSearch({
      serviceType: isTransfer ? "transfer" : serviceType,
      transferMode: "private",
      pickupLocation: `${selectedAirport.code} - ${selectedAirport.name}, ${selectedAirport.city}`,
      dropoffLocation: isTransfer ? dropoffLocation : "",
      pickupDate, pickupTime, returnDate, returnTime, roundTrip,
      passengers: Math.max(1, passengers),
      pickupAirportCode: selectedAirport.code,
      arrivalAirportCode: selectedAirport.code,
      destinationCity: selectedAirport.city,
      destinationCountry: selectedAirport.country
    });
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
      <div className="flex gap-2 mb-6 border-b border-slate-100 pb-4">
        {[{ type: "transfer", label: "Airport Transfers", icon: Plane }, { type: "car_hire", label: "Car Hire", icon: Car }, { type: "parking", label: "Airport Parking", icon: ParkingCircle }].map((tab) => { const Icon = tab.icon; const active = serviceType === tab.type; return <button key={tab.type} type="button" onClick={() => setServiceType(tab.type as ServiceType)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${active ? "bg-sky-500 text-white shadow-md" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}><Icon className="w-4 h-4" /><span>{tab.label}</span></button>; })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Airport</label>
          <div className="relative"><MapPin className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="Enter airport code or name (LHR, Heathrow, JFK...)" autoComplete="off" className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white font-medium" /></div>
          {(airportOptions.length > 0 || loadingAirports) && !selectedAirport && <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">{loadingAirports && <div className="px-4 py-3 text-xs text-slate-500">Searching airports worldwide…</div>}{!loadingAirports && airportOptions.slice(0, 8).map((airport) => <button key={`${airport.code}-${airport.name}`} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseAirport(airport)} className="w-full text-left px-4 py-3 hover:bg-sky-50 border-b border-slate-100 last:border-0"><div className="font-semibold text-sm text-slate-900">{airport.code} — {airport.name}</div><div className="text-xs text-slate-500">{airport.city}, {airport.country}</div></button>)}</div>}
        </div>
        {isTransfer && <div className="relative">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Hotel / Area</label>
          <div className="relative"><Hotel className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} disabled={!selectedAirport} placeholder={selectedAirport ? (loadingDestinations ? "Finding hotels & areas worldwide…" : `Search hotel or area near ${selectedAirport.city || selectedAirport.code}`) : "Select an airport first"} className="w-full pl-9 pr-9 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white font-medium disabled:opacity-50" />{selectedAirport && <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 text-slate-400 pointer-events-none" />}</div>
          {selectedAirport && (hotels.length > 0 || areas.length > 0) && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
              {hotels.length > 0 && <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Hotels</div>}
              {hotels.filter((hotel) => !dropoffLocation || `${hotel.name} ${hotel.address}`.toLowerCase().includes(dropoffLocation.toLowerCase())).slice(0, 12).map((hotel) => <button key={hotel.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setDropoffLocation(`${hotel.name}, ${hotel.address}`)} className="w-full text-left px-4 py-2.5 hover:bg-sky-50 border-b border-slate-100"><div className="font-semibold text-xs text-slate-900">{hotel.name}</div><div className="text-[11px] text-slate-500 truncate">{hotel.address}</div></button>)}
              {areas.length > 0 && <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50">Areas</div>}
              {areas.filter((area) => !dropoffLocation || area.name.toLowerCase().includes(dropoffLocation.toLowerCase())).slice(0, 12).map((area) => <button key={area.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setDropoffLocation(area.name)} className="w-full text-left px-4 py-2.5 hover:bg-sky-50 border-b border-slate-100"><div className="font-semibold text-xs text-slate-900">{area.name}</div><div className="text-[11px] text-slate-500 capitalize">{area.type.replace("_", " ")}</div></button>)}
            </div>
          )}
          {selectedAirport && !loadingDestinations && hotels.length === 0 && areas.length === 0 && <p className="mt-1 text-xs text-slate-500">No nearby places loaded. You can still enter the destination manually.</p>}
        </div>}
        <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pickup Date</label><div className="relative"><Calendar className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white font-medium" /></div></div>
        <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pickup Time</label><div className="relative"><Clock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white font-medium" /></div></div>
        {isTransfer && (
          <div className="lg:col-span-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setRoundTrip(!roundTrip)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${roundTrip ? "bg-sky-50 border-sky-300 text-sky-700" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
              <Repeat2 className="w-4 h-4" /> Return Transfer
            </button>
            {roundTrip && <>
              <div className="relative"><Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" /><input type="date" value={returnDate} min={pickupDate || undefined} onChange={(e) => setReturnDate(e.target.value)} className="pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl" /></div>
              <div className="relative"><Clock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" /><input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className="pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl" /></div>
            </>}
          </div>
        )}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-500" /><span className="text-xs font-bold text-slate-700 uppercase">Passengers:</span><select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="bg-slate-50 border border-slate-200 text-sm font-semibold rounded-lg px-2.5 py-1.5">{[1,2,3,4,5,6,7,8].map((num) => <option key={num} value={num}>{num} {num === 1 ? "Passenger" : "Passengers"}</option>)}</select></div>
        <button type="button" disabled={!canSubmit} onClick={handleSubmit} className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg ${canSubmit ? "bg-sky-500 hover:bg-sky-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}><Search className="w-4 h-4" /> Search Rides</button>
      </div>
    </div>
  );
}
