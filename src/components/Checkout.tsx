import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Users,
  Briefcase,
  Plane,
  Car,
  ParkingCircle,
  ShieldCheck,
  Loader2,
  CreditCard,
  Sparkles,
} from "lucide-react";
import type { Vehicle, SearchParams, BookingExtras } from "../lib/types";
import { formatPrice, convertFromUSD, DEFAULT_CURRENCY } from "../lib/currencies";
import { getAirportByCode } from "../lib/data";
import { calculateVehiclePriceUSD, PRICE_MARGIN } from "../lib/pricing";

declare const Razorpay: any;

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "https://zippygo-transfers-backend.onrender.com").replace(/\/$/, "");

interface CheckoutProps {
  vehicle: Vehicle;
  searchParams: SearchParams;
  currency: string;
  onBack: () => void;
}

const EXTRA_PRICES: Record<keyof BookingExtras, number> = {
  meetGreet: 15,
  childSeat: 10,
  extraStops: 20,
  flightTracking: 8,
};

export function Checkout({
  vehicle,
  searchParams,
  currency,
  onBack,
}: CheckoutProps) {
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

  const pricing = calculateVehiclePriceUSD(vehicle, searchParams);
  const basePrice = pricing.totalUSD;
  const perPersonPrice = pricing.perPersonUSD;

  const extrasTotal = Object.entries(extras).reduce(
    (sum, [key, val]) =>
      val ? sum + EXTRA_PRICES[key as keyof BookingExtras] * PRICE_MARGIN : sum,
    0
  );

  const totalUSD = basePrice + extrasTotal;
  // Razorpay must receive the exact INR amount shown to the customer, in paise.
  const totalINR = Math.round(convertFromUSD(totalUSD, DEFAULT_CURRENCY));

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const toggleExtra = (key: keyof BookingExtras) => {
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!phone.trim() || phone.length < 7) {
      setError("Please enter a valid contact phone number.");
      return false;
    }
    return true;
  };

  const handlePay = async () => {
    setError("");

    if (!validateForm()) return;

    if (typeof Razorpay === "undefined") {
      setError("Payment SDK is loading. Please try again in a moment.");
      return;
    }

    try {
      setLoading(true);

      const bookingRef = `ZGO-${Date.now().toString(36).toUpperCase()}`;

      localStorage.setItem("zippygo-pending-payment", JSON.stringify({
        bookingRef,
        totalAmount: totalUSD,
        currency: DEFAULT_CURRENCY,
        vehicle,
        searchParams,
      }));

      const response = await fetch(`${BACKEND_URL}/api/create-razorpay-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalINR,
          currency: DEFAULT_CURRENCY,
          bookingRef,
          customer: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
          },
          booking: {
            service_type: searchParams.serviceType,
            pickup_location: searchParams.pickupLocation,
            dropoff_location: searchParams.dropoffLocation,
            pickup_date: searchParams.pickupDate,
            pickup_time: searchParams.pickupTime,
            return_date: searchParams.returnDate,
            vehicle_id: vehicle.id,
            vehicle_name: vehicle.name,
            passengers: searchParams.passengers,
            flight_number: flightNumber.trim(),
            extras,
          },
        }),
      });

      const rawText = await response.text();
      let data: any = {};

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(`Server returned non-JSON response (HTTP ${response.status}).`);
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || `Failed to create payment session (HTTP ${response.status}).`);
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: "ZippyGo Transfers",
        description: `Booking ${data.bookingRef}`,
        order_id: data.order_id,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone.trim(),
        },
        handler: function (response: any) {
          window.location.href = `/?payment_status=success&booking_ref=${encodeURIComponent(
            data.bookingRef
          )}&payment_id=${encodeURIComponent(response.razorpay_payment_id)}`;
        },
        theme: {
          color: "#0284c7",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during checkout.");
      setLoading(false);
    }
  };

  const serviceIcon =
    searchParams.serviceType === "transfer"
      ? Plane
      : searchParams.serviceType === "car_hire"
      ? Car
      : ParkingCircle;
  const ServiceIcon = serviceIcon;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ServiceIcon className="w-5 h-5 text-sky-500" /> Booking Details
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoRow label="Service">
                  {searchParams.serviceType === "transfer"
                    ? "Airport Transfer"
                    : searchParams.serviceType === "car_hire"
                    ? "Car Hire"
                    : "Airport Parking"}
                </InfoRow>
                <InfoRow label="Date">{searchParams.pickupDate}</InfoRow>
                {searchParams.serviceType === "transfer" ? (
                  <>
                    <InfoRow label="Pickup / Arrival Airport">
                      {searchParams.pickupLocation}
                    </InfoRow>
                    <InfoRow label="Destination">
                      {searchParams.dropoffLocation}
                    </InfoRow>
                    {searchParams.arrivalAirportCode && (
                      <InfoRow label="Destination Airport">
                        {getAirportByCode(searchParams.arrivalAirportCode)?.name ||
                          searchParams.arrivalAirportCode}
                      </InfoRow>
                    )}
                    <InfoRow label="Pick-up Time">
                      {searchParams.pickupTime}
                    </InfoRow>
                    {searchParams.roundTrip && (
                      <>
                        <InfoRow label="Return Date">
                          {searchParams.returnDate}
                        </InfoRow>
                        <InfoRow label="Return Time">
                          {searchParams.returnTime}
                        </InfoRow>
                        <InfoRow label="Trip Type">
                          Round Trip (Both Ways)
                        </InfoRow>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <InfoRow label="Location">
                      {searchParams.pickupLocation}
                    </InfoRow>
                    {searchParams.returnDate && (
                      <InfoRow label="Return Date">
                        {searchParams.returnDate}
                      </InfoRow>
                    )}
                  </>
                )}
                <InfoRow label="Adults">{searchParams.passengers}</InfoRow>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-500" /> Add Extras
              </h3>
              <div className="space-y-3">
                {(Object.keys(EXTRA_PRICES) as (keyof BookingExtras)[]).map(
                  (key) => {
                    const labels: Record<keyof BookingExtras, string> = {
                      meetGreet: "Meet & Greet Service",
                      childSeat: "Child Seat",
                      extraStops: "Extra Stops",
                      flightTracking: "Flight Tracking",
                    };
                    return (
                      <label
                        key={key}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-sky-300 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              extras[key]
                                ? "bg-sky-500 border-sky-500"
                                : "border-slate-300"
                            }`}
                          >
                            {extras[key] && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm text-slate-700">
                            {labels[key]}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          +{formatPrice(EXTRA_PRICES[key] * PRICE_MARGIN, currency)}
                        </span>
                        <input
                          type="checkbox"
                          checked={extras[key]}
                          onChange={() => toggleExtra(key)}
                          className="sr-only"
                        />
                      </label>
                    );
                  }
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">
                Passenger Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  value={name}
                  onChange={setName}
                  placeholder="John Doe"
                  required
                />
                <InputField
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeholder="john@example.com"
                  type="email"
                  required
                />
                <InputField
                  label="Phone"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+919177902449"
                  type="tel"
                  required
                />
                <InputField
                  label="Flight Number (optional)"
                  value={flightNumber}
                  onChange={setFlightNumber}
                  placeholder="BA123"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:sticky lg:top-24">
              <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 mb-4">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {vehicle.name}
              </h3>
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
                  <span>Per-person price</span>
                  <span>{formatPrice(perPersonPrice, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Passengers</span>
                  <span>× {pricing.passengerCount}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Transfer subtotal</span>
                  <span>{formatPrice(basePrice, currency)}</span>
                </div>
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
                  <span className="text-base font-semibold text-slate-900">
                    Total
                  </span>
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

              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full mt-5 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/30 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" /> Pay{" "}
                    {formatPrice(totalUSD, currency)}
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Secured by Razorpay · Free cancellation up to 24h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-slate-800 font-medium mt-0.5">{children}</p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-sm text-slate-900 placeholder-slate-400"
      />
    </div>
  );
}
