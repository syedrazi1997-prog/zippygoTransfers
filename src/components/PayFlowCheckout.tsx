import { useState } from "react";
import { ArrowLeft, CreditCard, Globe, Lock, Loader2, ShieldCheck } from "lucide-react";
import type { Vehicle, SearchParams, BookingExtras } from "../lib/types";
import { calculateVehiclePriceUSD } from "../lib/pricing";
import { convertFromUSD, formatPrice } from "../lib/currencies";
import { databases } from "../lib/appwrite";
import { ID } from "appwrite";

interface PayFlowCheckoutProps {
  vehicle: Vehicle;
  searchParams: SearchParams;
  currency: string;
  onBack: () => void;
  checkoutDetails?: {
    extras: BookingExtras;
    flightNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  onStarted: (bookingRef: string, totalUSD: number) => void;
}

export function PayFlowCheckout({ vehicle, searchParams, currency, onBack, checkoutDetails, onStarted }: PayFlowCheckoutProps) {
  const [email, setEmail] = useState(checkoutDetails?.customerEmail || "");
  const [name, setName] = useState(checkoutDetails?.customerName || "");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const pricing = calculateVehiclePriceUSD(vehicle, searchParams);
  const extras = checkoutDetails?.extras || {
    meetGreet: false,
    childSeat: false,
    extraStops: false,
    flightTracking: false,
  };
  const EXTRA_PRICES: Record<keyof BookingExtras, number> = {
    meetGreet: 15,
    childSeat: 10,
    extraStops: 20,
    flightTracking: 8,
  };
  const extrasTotalUSD = (Object.entries(extras) as [keyof BookingExtras, boolean][])
    .reduce((sum, [key, selected]) => selected ? sum + EXTRA_PRICES[key] * 1.05 : sum, 0);
  const totalUSD = pricing.totalUSD + extrasTotalUSD;
  // totalUSD is the canonical internal amount in USD. Convert exactly once
  // for display and for the PayFlow API request.
  const amount = Math.round(convertFromUSD(totalUSD, currency) * 100) / 100;

  async function handlePay() {
    setError("");
    if (!email.trim() || !name.trim()) {
      setError("Please enter your name and email address.");
      return;
    }

    setProcessing(true);
    try {
      const bookingRef = `ZGO-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
      const backendUrl = (import.meta.env.VITE_BACKEND_URL || window.location.origin).replace(/\/+$/, "");

      // Create the pending ZippyGo booking before payment starts.
      await databases.createDocument(
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
          customer_name: name.trim(),
          customer_email: email.trim(),
          amount: String(totalUSD),
          currency,
          amount_in_currency: String(amount),
          customer_phone: checkoutDetails?.customerPhone || null,
          flight_number: checkoutDetails?.flightNumber || null,
          extras: JSON.stringify(extras),
          booking_ref: bookingRef,
        }
      );

      localStorage.setItem("zippygo-pending-payment", JSON.stringify({
        bookingRef,
        totalAmount: totalUSD,
        currency,
        vehicle,
        searchParams,
      }));

      const response = await fetch(`${backendUrl}/api/create-payflow-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency,
          bookingRef,
          customer: {
            name: name.trim(),
            email: email.trim(),
            phone: checkoutDetails?.customerPhone || "",
          },
          title: "ZippyGo Transfers",
          description: `${vehicle.name} · ${pricing.passengerCount} passenger${pricing.passengerCount === 1 ? "" : "s"} · ${bookingRef}`,
          phone: checkoutDetails?.customerPhone || "",
        }),
      });

      const data = await response.json().catch(() => ({}));
      const publicUrl = String(import.meta.env.VITE_PAYFLOW_PUBLIC_URL || "https://payflow-com.onrender.com").replace(/\/+$/, "");
      const checkoutUrl = data.checkout_url || data.url || (data.link_id ? `${publicUrl}/checkout/${encodeURIComponent(String(data.link_id))}` : "");

      if (!response.ok || !checkoutUrl) {
        throw new Error(data.error || "Unable to start secure payment checkout.");
      }

      onStarted(bookingRef, totalUSD);
      window.location.assign(checkoutUrl);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unable to start payment. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-16">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white"><Globe className="w-4 h-4" /></div>
            <span className="font-semibold text-slate-900">PayFlow</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400"><Lock className="w-3 h-3" /> Secured by Razorpay</div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"><ArrowLeft className="w-4 h-4" /> Back</button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-medium text-slate-500 mb-1">Paying</h2>
              <p className="text-3xl font-bold text-slate-900">{formatPrice(totalUSD, currency)}</p>
              <h3 className="text-base font-semibold text-slate-900 mt-3">ZippyGo Transfers</h3>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Choose a payment method</h3>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-slate-900 bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                <span className="text-sm font-medium text-slate-900 flex-1 text-left">Credit / Debit Card</span>
                <div className="w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-slate-900" /></div>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-medium text-slate-700">Your Details</h3>
              <label className="block"><span className="text-sm text-slate-600">Email</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-slate-400" /></label>
              <label className="block"><span className="text-sm text-slate-600">Name</span><input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="w-full mt-1 px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-slate-400" /></label>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start gap-3"><ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5" /><p className="text-sm text-slate-600">You'll be redirected to Razorpay's secure checkout to complete your payment. Razorpay supports cards, UPI, net banking, and wallets.</p></div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:sticky lg:top-24">
              <h3 className="text-sm font-medium text-slate-700 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Per-person price</span><span className="font-medium text-slate-900">{formatPrice(pricing.perPersonUSD, currency)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Passengers</span><span className="font-medium text-slate-900">× {pricing.passengerCount}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Transfer subtotal</span><span className="font-medium text-slate-900">{formatPrice(pricing.totalUSD, currency)}</span></div>
                {extrasTotalUSD > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Add-ons</span><span className="font-medium text-slate-900">{formatPrice(extrasTotalUSD, currency)}</span></div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100"><span className="font-semibold text-slate-900">Total</span><span className="font-bold text-slate-900">{formatPrice(totalUSD, currency)}</span></div>
              </div>
              {error && <div className="mb-3 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</div>}
              <button onClick={handlePay} disabled={processing} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60">
                {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <>Pay {formatPrice(totalUSD, currency)}</>}
              </button>
              <p className="text-xs text-slate-400 text-center mt-3 flex items-center justify-center gap-1.5"><Lock className="w-3 h-3" /> Payments are secured and encrypted by Razorpay</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
