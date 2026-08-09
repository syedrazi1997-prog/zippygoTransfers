import { useState } from "react";
import { ArrowLeft, Check, Users, Briefcase, Plane, Car, ParkingCircle, ShieldCheck, Loader2, CreditCard, Sparkles } from "lucide-react";
import type { Vehicle, SearchParams, BookingExtras } from "../lib/types";
import { formatPrice } from "../lib/currencies";
import { databases } from "../lib/appwrite";
import { ID } from "appwrite";

interface CheckoutProps {
  vehicle: Vehicle;
  searchParams: SearchParams;
  currency: string;
  onBack: () => void;
  onComplete: (bookingRef: string) => void;
}

const EXTRA_PRICES: Record<keyof BookingExtras, number> = {
  meetGreet: 15,
  childSeat: 10,
  extraStops: 20,
  flightTracking: 8,
};

export function Checkout({ vehicle, searchParams, currency, onBack, onComplete }: CheckoutProps) {
  const [extras, setExtras] = useState<BookingExtras>({
    meetGreet: false,
    childSeat: false,
    extraStops: false,
    flightTracking: false,
  });
  const [flightNumber, setFlightNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const days = (() => {
    if (searchParams.returnDate && searchParams.pickupDate) {
      const diff = Math.ceil((new Date(searchParams.returnDate).getTime() - new Date(searchParams.pickupDate).getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(diff, 1);
    }
    return 1;
  })();

  const MARGIN = 1.05;
  const pax = Math.max(Number(searchParams.passengers) || 1, 1);

  // Transfer supplier price is a PER-PERSON rate.
  // Do not divide by passenger count here. The final booking total
  // must multiply the per-person rate by the number of passengers.
  const transferPerPersonPrice =
    vehicle.basePriceUSD *
    vehicle.transferMultiplier *
    MARGIN *
    (searchParams.roundTrip ? 2 : 1);

  const basePrice = (() => {
    if (searchParams.serviceType === "transfer") {
      // Display price for one passenger.
      return transferPerPersonPrice;
    } else if (searchParams.serviceType === "car_hire") {
      return vehicle.basePriceUSD * vehicle.carHireDailyMultiplier * MARGIN * days;
    } else {
      return vehicle.parkingDailyUSD * MARGIN * days;
    }
  })();

  // Extras are charged once per booking.
  const extrasTotal = Object.entries(extras).reduce(
    (sum, [key, val]) =>
      val ? sum + EXTRA_PRICES[key as keyof BookingExtras] * MARGIN : sum,
    0
  );

  // Transfers are per passenger; car hire and parking remain booking-level.
  const passengerBaseTotal =
    searchParams.serviceType === "transfer"
      ? basePrice * pax
      : basePrice;

  const totalUSD = passengerBaseTotal + extrasTotal;

  const toggleExtra = (key: keyof BookingExtras) => {
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePay = async () => {
    setError("");
    if (!name || !email || !phone) {
      setError("Please fill in all passenger details.");
      return;
    }
    setLoading(true);

    try {
      // 1. Generate unique booking reference prefix layout
      const customBookingRef = `ZGO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // 2. Insert Document Into Appwrite
      const bookingData = await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        "bookings", 
        ID.unique(),
        {
          service_type: searchParams.serviceType,
          pickup_location: searchParams.pickupLocation,
          dropoff_location: searchParams.dropoffLocation || null,
          pickup_date: searchParams.pickupDate,
          pickup_time: searchParams.pickupTime,
          return_date: searchParams.returnDate || null,
          vehicle_id: vehicle.id,
          vehicle_name: vehicle.name,
          passengers: String(searchParams.passengers),
          luggage: String(vehicle.luggage),
          flight_number: flightNumber || null,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          amount: String(totalUSD),
          currency: currency,
          amount_in_currency: String(totalUSD),
          extras: JSON.stringify(extras),
          booking_ref: customBookingRef,
        }
      );

      const bookingId = bookingData.$id;
      const bookingRef = bookingData.booking_ref;

      // 3. Dynamic cleanup of Appwrite endpoint to avoid double-slash crashes
      const cleanedEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT.replace(/\/+$/, "");
      const functionUrl = `${cleanedEndpoint}/functions/${import.meta.env.VITE_APPWRITE_FUNCTION_ID}/executions`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": import.meta.env.VITE_APPWRITE_PROJECT_ID,
        },
        body: JSON.stringify({
          data: JSON.stringify({
            action: "create_order",
            amount: totalUSD,
            currency: currency === "INR" ? "INR" : "USD",
            bookingId,
            bookingRef,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
          })
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "Failed to initiate payment. Please try again.");
        setLoading(false);
        return;
      }

      const executionResult = await response.json();
      const orderData = JSON.parse(executionResult.responseBody || executionResult.response || "{}");

      if (orderData.error) {
        setError(orderData.error);
        setLoading(false);
        return;
      }

      // Initialize Cashfree Javascript Web SDK Dropin Core
      const cashfree = await (window as any).Cashfree({
        mode: "sandbox" // Change to "production" when switching Cashfree toggles live
      });

      await cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: "_self" 
      });

      // Appwrite webhook handlers or verification functions process completion workflows updates asynchronously
      onComplete(bookingRef);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  const serviceIcon = searchParams.serviceType === "transfer" ? Plane : searchParams.serviceType === "car_hire" ? Car : ParkingCircle;
  const ServiceIcon = serviceIcon;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ServiceIcon className="w-5 h-5 text-sky-500" /> Booking Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoRow label="Service">{searchParams.serviceType === "transfer" ? "Airport Transfer" : searchParams.serviceType === "car_hire" ? "Car Hire" : "Airport Parking"}</InfoRow>
                <InfoRow label="Date">{searchParams.pickupDate}</InfoRow>
                {searchParams.serviceType === "transfer" ? (
                  <>
                    <InfoRow label="From">{searchParams.pickupLocation}</InfoRow>
                    <InfoRow label="To">{searchParams.dropoffLocation}</InfoRow>
                    <InfoRow label="Pick-up Time">{searchParams.pickupTime}</InfoRow>
                    {searchParams.roundTrip && (
                      <>
                        <InfoRow label="Return Date">{searchParams.returnDate}</InfoRow>
                        <InfoRow label="Return Time">{searchParams.returnTime}</InfoRow>
                        <InfoRow label="Trip Type">Round Trip (Both Ways)</InfoRow>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <InfoRow label="Location">{searchParams.pickupLocation}</InfoRow>
                    {searchParams.returnDate && <InfoRow label="Return Date">{searchParams.returnDate}</InfoRow>}
                  </>
                )}
                <InfoRow label="Passengers">{searchParams.passengers}</InfoRow>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" /> Add Extras
              </h3>
              <div className="space-y-3">
                {(Object.keys(EXTRA_PRICES) as (keyof BookingExtras)[]).map((key) => {
                  const labels: Record<keyof BookingExtras, string> = {
                    meetGreet: "Meet & Greet Service",
                    childSeat: "Child Seat",
                    extraStops: "Extra Stops",
                    flightTracking: "Flight Tracking",
                  };
                  return (
                    <label key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-sky-300 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${extras[key] ? "bg-sky-500 border-sky-500" : "border-slate-300"}`}>
                          {extras[key] && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-slate-700">{labels[key]}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        +{formatPrice(EXTRA_PRICES[key], currency)}
                      </span>
                      <input type="checkbox" checked={extras[key]} onChange={() => toggleExtra(key)} className="sr-only" />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4"> Passenger Details </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Full Name" value={name} onChange={setName} placeholder="John Doe" />
                <InputField label="Email" value={email} onChange={setEmail} placeholder="john@example.com" type="email" />
                <InputField label="Phone" value={phone} onChange={setPhone} placeholder="9876543210" />
                <InputField label="Flight Number (optional)" value={flightNumber} onChange={setFlightNumber} placeholder="BA123" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:sticky lg:top-24">
              <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 mb-4">
                <img src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{vehicle.name}</h3>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {vehicle.passengers}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> {vehicle.luggage}
                </span>
              </div>

              <div className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>
                    Base price{" "}
                    {searchParams.serviceType === "transfer" && (
                      <span className="text-xs text-slate-400 ml-1">
                        ({searchParams.roundTrip ? "per person · return" : "per person · one way"})
                      </span>
                    )}
                  </span>
                  <span>{formatPrice(basePrice, currency)}</span>
                </div>
                {searchParams.serviceType === "transfer" && (
                  <div className="flex justify-between text-slate-600">
                    <span>Passengers</span>
                    <span>× {pax}</span>
                  </div>
                )}
                {searchParams.serviceType === "transfer" && (
                  <div className="flex justify-between text-slate-600">
                    <span>Transfer subtotal</span>
                    <span>{formatPrice(passengerBaseTotal, currency)}</span>
                  </div>
                )}
                {extrasTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Add-ons</span>
                    <span>{formatPrice(extrasTotal, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Taxes & fees</span>
                  <span className="text-green-600 font-medium">Included</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-semibold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {formatPrice(totalUSD, currency)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button onClick={handlePay} disabled={loading} className="w-full mt-5 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/30 disabled:opacity-60">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Pay {formatPrice(totalUSD, currency)}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Secured by Cashfree · Free cancellation up to 24h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-slate-800 font-medium mt-0.5">{children}</p>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-sm text-slate-900 placeholder-slate-400" />
    </div>
  );
}
