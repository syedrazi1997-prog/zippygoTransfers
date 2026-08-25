import { useEffect, useMemo, useRef, useState } from "react";
import { Plane, Car, ParkingCircle, MapPin, Calendar, Clock, Users, Search, Hotel } from "lucide-react";
import type { ServiceType, SearchParams } from "../lib/types";
import { getAirportFromLocation, getAirportByCode, getHotelsForAirport, getAreasForAirport, searchAirportsRemote, getAirportDestinationsRemote, geocodeDestination, searchDestinationsRemote, type RemoteAirportOption, type DestinationSearchOption } from "../lib/data";

interface SearchWidgetProps { onSearch: (params: SearchParams) => void; defaultService?: ServiceType; }

export function SearchWidget({ onSearch, defaultService = "transfer" }: SearchWidgetProps) {
  const [serviceType, setServiceType] = useState<ServiceType>(defaultService);
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("18:00");
  const [roundTrip, setRoundTrip] = useState(false);
  const [passengers, setPassengers] = useState(1);
  const [airportOptions, setAirportOptions] = useState<RemoteAirportOption[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<RemoteAirportOption | undefined>();
  const [hotels, setHotels] = useState<{ id: string; name: string; address: string; latitude?: number; longitude?: number }[]>([]);
  const [areas, setAreas] = useState<{ id: string; name: string; type: string; latitude?: number; longitude?: number }[]>([]);
  const [destinationCoordinates, setDestinationCoordinates] = useState<{ latitude: number; longitude: number } | undefined>();
  const [geocodingDestination, setGeocodingDestination] = useState(false);
  const [loadingAirports, setLoadingAirports] = useState(false);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [destinationOptions, setDestinationOptions] = useState<DestinationSearchOption[]>([]);
  const [showDestinationPopup, setShowDestinationPopup] = useState(false);
  const destinationSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fallbackAirport = useMemo(() => getAirportFromLocation(pickupLocation) || getAirportByCode(pickupLocation.trim().toUpperCase()), [pickupLocation]);

  useEffect(() => {
    setSelectedAirport(undefined); setDropoffLocation(""); setHotels([]); setAreas([]); setDestinationCoordinates(undefined); setDestinationOptions([]); setShowDestinationPopup(false);
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
    setSelectedAirport(airport); setShowDestinationPopup(false); setDestinationOptions([]); setPickupLocation(`${airport.code} — ${airport.name}`); setAirportOptions([]); setDropoffLocation(""); setDestinationCoordinates(undefined);
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

  useEffect(() => {
    if (destinationSearchTimer.current) clearTimeout(destinationSearchTimer.current);
    const query = dropoffLocation.trim();
    if (!selectedAirport || query.length < 2) { setDestinationOptions([]); return; }
    destinationSearchTimer.current = setTimeout(async () => {
      try {
        const remote = await searchDestinationsRemote(query, selectedAirport);
        setDestinationOptions(remote);
      } catch { setDestinationOptions([]); }
    }, 350);
    return () => { if (destinationSearchTimer.current) clearTimeout(destinationSearchTimer.current); };
  }, [dropoffLocation, selectedAirport]);

  function chooseDestination(option: DestinationSearchOption) {
    setDropoffLocation(option.displayName);
    setDestinationCoordinates({ latitude: option.latitude, longitude: option.longitude });
    setDestinationOptions([]);
    setShowDestinationPopup(false);
  }

  const requiresDestination = serviceType === "transfer";
  const canSubmit = !!selectedAirport && !!pickupDate && (!requiresDestination || !!dropoffLocation) &&
    (!roundTrip && serviceType === "transfer" || !!returnDate || (serviceType === "transfer" && !roundTrip));

  const durationLabel = returnDate && pickupDate ? (() => {
    const days = Math.max(1, Math.ceil((new Date(returnDate).getTime() - new Date(pickupDate).getTime()) / 86400000));
    return `${days} day${days === 1 ? "" : "s"}`;
  })() : "";

  async function handleSubmit() {
    if (!selectedAirport || !canSubmit || geocodingDestination) return;
    let coords = destinationCoordinates;
    if (serviceType === "transfer" && dropoffLocation && !coords) {
      const hotel = hotels.find((item) => `${item.name}, ${item.address}`.toLowerCase() === dropoffLocation.toLowerCase());
      const area = areas.find((item) => item.name.toLowerCase() === dropoffLocation.toLowerCase());
      const candidate = hotel || area;
      if (candidate?.latitude !== undefined && candidate?.longitude !== undefined) {
        coords = { latitude: candidate.latitude, longitude: candidate.longitude };
      } else {
        setGeocodingDestination(true);
        try {
          const located = await geocodeDestination(dropoffLocation, selectedAirport);
          if (located) coords = { latitude: located.latitude, longitude: located.longitude };
        } finally {
          setGeocodingDestination(false);
        }
      }
    }
    const routeDistanceKm = coords && Number.isFinite(selectedAirport.latitude) && Number.isFinite(selectedAirport.longitude)
      ? (() => {
          const rad = Math.PI / 180;
          const dLat = (coords.latitude - selectedAirport.latitude) * rad;
          const dLon = (coords.longitude - selectedAirport.longitude) * rad;
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(selectedAirport.latitude * rad) * Math.cos(coords.latitude * rad) * Math.sin(dLon / 2) ** 2;
          return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        })()
      : undefined;
    onSearch({ serviceType, pickupLocation: `${selectedAirport.code} - ${selectedAirport.name}, ${selectedAirport.city}`, dropoffLocation: serviceType === "transfer" ? dropoffLocation : `${selectedAirport.name}, ${selectedAirport.city}`, pickupDate, pickupTime, returnDate: returnDate || undefined, returnTime: returnDate ? returnTime : undefined, roundTrip: serviceType === "transfer" ? roundTrip : true, passengers: Math.max(1, passengers), pickupAirportCode: selectedAirport.code, arrivalAirportCode: selectedAirport.code, destinationCity: selectedAirport.city, destinationCountry: selectedAirport.country, pickupLatitude: selectedAirport.latitude, pickupLongitude: selectedAirport.longitude, destinationLatitude: coords?.latitude, destinationLongitude: coords?.longitude, routeDistanceKm });
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
          {(airportOptions.length > 0 || loadingAirports) && !selectedAirport && <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">{loadingAirports && <div className="px-4 py-3 text-xs text-slate-500">Searching airports worldwide…</div>}{!loadingAirports && airportOptions.slice(0, 8).map((airport) => <button key={`${airport.code}-${airport.name}`} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseAirport(airport)} className="w-full text-left px-4 py-3 hover:bg-sky-50 border-b border-slate-100 last:border-0"><div className="font-semibold text-sm text-slate-900">{airport.code} — {airport.name}</div><div className="text-xs text-slate-500">{airport.city}, {airport.countryName || airport.country}</div></button>)}</div>}
        </div>
        {serviceType === "transfer" && <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nearby Hotel / Area / Exact Destination</label>
          <div className="relative">
            <Hotel className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input value={dropoffLocation} onFocus={() => { if (selectedAirport) setShowDestinationPopup(true); }} onChange={(e) => { const value = e.target.value; setDropoffLocation(value); setShowDestinationPopup(true); const hotel = hotels.find((item) => `${item.name}, ${item.address}`.toLowerCase() === value.toLowerCase()); const area = areas.find((item) => item.name.toLowerCase() === value.toLowerCase()); const candidate = hotel || area; setDestinationCoordinates(candidate?.latitude !== undefined && candidate?.longitude !== undefined ? { latitude: candidate.latitude, longitude: candidate.longitude } : undefined); }} disabled={!selectedAirport} placeholder={selectedAirport ? (loadingDestinations ? "Finding nearby hotels & areas…" : "Type hotel, area, landmark or exact place") : "Select an airport first"} autoComplete="off" className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white font-medium disabled:opacity-50" />
            {selectedAirport && showDestinationPopup && <div className="absolute z-[60] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
              <div className="px-4 py-2.5 bg-slate-50 border-b text-[11px] font-bold uppercase tracking-wider text-slate-500">{dropoffLocation.trim().length >= 2 ? "Matching exact locations" : `Popular places near ${selectedAirport.code}`}</div>
              {loadingDestinations && <div className="px-4 py-3 text-xs text-slate-500">Finding nearby hotels & areas…</div>}
              {!loadingDestinations && dropoffLocation.trim().length < 2 && [...hotels.slice(0, 8).map(h => ({ id:h.id, name:h.name, displayName:`${h.name}, ${h.address}`, latitude:h.latitude, longitude:h.longitude, type:"hotel" })), ...areas.slice(0, 8).map(a => ({ id:a.id, name:a.name, displayName:a.name, latitude:a.latitude, longitude:a.longitude, type:a.type }))].map((item) => item.latitude !== undefined && item.longitude !== undefined ? <button key={item.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseDestination(item as DestinationSearchOption)} className="w-full text-left px-4 py-3 hover:bg-sky-50 border-b border-slate-100 last:border-0"><div className="font-semibold text-sm text-slate-900">{item.name}</div><div className="text-xs text-slate-500">{item.displayName} · {item.type}</div></button> : null)}
              {!loadingDestinations && dropoffLocation.trim().length >= 2 && destinationOptions.map((item) => <button key={item.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseDestination(item)} className="w-full text-left px-4 py-3 hover:bg-sky-50 border-b border-slate-100 last:border-0"><div className="font-semibold text-sm text-slate-900">{item.name}</div><div className="text-xs text-slate-500">{item.displayName}</div></button>)}
              {!loadingDestinations && dropoffLocation.trim().length >= 2 && destinationOptions.length === 0 && <div className="px-4 py-4 text-xs text-slate-500">No exact match found. You can keep typing the full hotel, address, landmark or area and we will locate it.</div>}
            </div>}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Click the box to see nearby places, or type any hotel, landmark, area or exact address worldwide.</p>
        </div>}
        <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pickup Date</label><div className="relative"><Calendar className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white font-medium" /></div></div>
        <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Time</label><div className="relative"><Clock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white font-medium" /></div></div>
        <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Return / End Date</label><div className="relative"><Calendar className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input type="date" min={pickupDate || undefined} value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white font-medium" /></div><p className="mt-1 text-[11px] text-slate-500">{serviceType === "transfer" ? "Optional for one-way. Required for return." : "Required to calculate hire/parking duration."}</p></div>
        {returnDate && <div><label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Return / End Time</label><div className="relative"><Clock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" /><input type="time" value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white font-medium" /></div></div>}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        {serviceType === "transfer" && <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer"><input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500" /> Return transfer</label>}
        {durationLabel && <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full">Duration: {durationLabel}</span>}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-500" /><span className="text-xs font-bold text-slate-700 uppercase">Passengers:</span><select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} className="bg-slate-50 border border-slate-200 text-sm font-semibold rounded-lg px-2.5 py-1.5">{[1,2,3,4,5,6,7,8].map((num) => <option key={num} value={num}>{num} {num === 1 ? "Passenger" : "Passengers"}</option>)}</select></div>
        <button type="button" disabled={!canSubmit || geocodingDestination} onClick={handleSubmit} className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg ${canSubmit ? "bg-sky-500 hover:bg-sky-600 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}><Search className="w-4 h-4" /> {geocodingDestination ? "Locating destination…" : serviceType === "transfer" ? "Search Transfer Prices" : serviceType === "car_hire" ? "Search Car Hire Prices" : "Search Parking Prices"}</button>
      </div>
    </div>
  );
}
