import { useState } from "react";
import { Search, ArrowLeft, Plane, Car, ParkingCircle, Calendar, MapPin, Clock, Users, CheckCircle, XCircle, Loader2, Zap, Download } from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatPrice } from "../lib/currencies";

interface ManageBookingProps {
  currency: string;
  onBack: () => void;
}

interface BookingRecord {
  id: string;
  booking_ref: string;
  service_type: string;
  pickup_location: string;
  dropoff_location: string | null;
  pickup_date: string;
  pickup_time: string;
  return_date: string | null;
  vehicle_name: string;
  passengers: number;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  payment_status: string;
  created_at: string;
}

export function ManageBooking({ currency, onBack }: ManageBookingProps) {
  const [bookingRef, setBookingRef] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const handleSearch = async () => {
    setError("");
    setBooking(null);

    if (!bookingRef || !email) {
      setError("Please enter both your booking reference and email address.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: queryError } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_ref", bookingRef.toUpperCase().trim())
        .eq("customer_email", email.toLowerCase().trim())
        .maybeSingle();

      if (queryError) {
        setError("Failed to search for booking. Please try again.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("No booking found with this reference and email. Please check and try again.");
        setLoading(false);
        return;
      }

      setBooking(data as unknown as BookingRecord);
      setLoading(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);

    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ payment_status: "failed" })
        .eq("id", booking.id);

      if (updateError) {
        setError("Failed to cancel booking. Please contact support.");
        setCancelling(false);
        return;
      }

      setBooking({ ...booking, payment_status: "cancelled" });
      setCancelling(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setCancelling(false);
    }
  };

  const ServiceIcon =
    booking?.service_type === "transfer" ? Plane : booking?.service_type === "car_hire" ? Car : ParkingCircle;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manage My Booking</h1>
              <p className="text-sm text-slate-500">View, download, or cancel your booking</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Booking Reference
              </label>
              <input
                type="text"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                placeholder="e.g. ZG-AB12CD"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-sm text-slate-900 placeholder-slate-400 uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all text-sm text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-sky-500/20 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Find My Booking
              </>
            )}
          </button>
        </div>

        {booking && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-sky-400" fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Booking Reference</p>
                  <p className="text-lg font-bold text-white">{booking.booking_ref}</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                booking.payment_status === "paid"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : booking.payment_status === "pending"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                {booking.payment_status === "paid" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                {booking.payment_status === "failed" && <XCircle className="w-3 h-3 inline mr-1" />}
                {booking.payment_status === "cancelled" && <XCircle className="w-3 h-3 inline mr-1" />}
                {booking.payment_status === "paid" ? "Confirmed" : booking.payment_status === "pending" ? "Pending" : booking.payment_status === "cancelled" ? "Cancelled" : "Failed"}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                  <ServiceIcon className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{booking.vehicle_name}</p>
                  <p className="text-xs text-slate-500 capitalize">
                    {booking.service_type === "car_hire" ? "Car Hire" : booking.service_type === "transfer" ? "Airport Transfer" : "Airport Parking"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <DetailItem icon={MapPin} label="Pickup">
                  {booking.pickup_location}
                </DetailItem>
                {booking.dropoff_location && (
                  <DetailItem icon={MapPin} label="Drop-off">
                    {booking.dropoff_location}
                  </DetailItem>
                )}
                <DetailItem icon={Calendar} label="Date">
                  {booking.pickup_date}
                </DetailItem>
                <DetailItem icon={Clock} label="Time">
                  {booking.pickup_time}
                </DetailItem>
                {booking.return_date && (
                  <DetailItem icon={Calendar} label="Return Date">
                    {booking.return_date}
                  </DetailItem>
                )}
                <DetailItem icon={Users} label="Passengers">
                  {booking.passengers}
                </DetailItem>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-500">Customer</span>
                  <span className="text-sm font-medium text-slate-900">{booking.customer_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Total Paid</span>
                  <span className="text-lg font-bold text-slate-900">
                    {formatPrice(booking.amount, currency)}
                  </span>
                </div>
              </div>

              {booking.payment_status === "paid" && (
                <div className="mt-6 flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors">
                    <Download className="w-4 h-4" />
                    Download Voucher
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {cancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Cancel Booking
                      </>
                    )}
                  </button>
                </div>
              )}

              {booking.payment_status === "cancelled" && (
                <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 text-center">
                  This booking has been cancelled. The refund will be processed within 5-7 business days.
                </div>
              )}
            </div>
          </div>
        )}

        {!booking && !loading && !error && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Find Your Booking</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Enter your booking reference (e.g. ZG-AB12CD) and the email address you used during booking to view details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Plane;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-slate-800 text-sm font-medium mt-0.5">{children}</p>
      </div>
    </div>
  );
}
