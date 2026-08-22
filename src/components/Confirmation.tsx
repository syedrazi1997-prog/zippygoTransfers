import { CheckCircle, Plane, Car, ParkingCircle, Calendar, MapPin, Clock, Download, Home, Zap } from "lucide-react";
import type { Vehicle, SearchParams } from "../lib/types";
import { formatPrice } from "../lib/currencies";

interface ConfirmationProps {
  bookingRef: string;
  vehicle: Vehicle;
  searchParams: SearchParams;
  currency: string;
  totalUSD: number;
  onHome: () => void;
}

export function Confirmation({
  bookingRef,
  vehicle,
  searchParams,
  currency,
  totalUSD,
  onHome,
}: ConfirmationProps) {
  const ServiceIcon =
    searchParams.serviceType === "transfer" ? Plane : searchParams.serviceType === "car_hire" ? Car : ParkingCircle;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-6 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Booking Confirmed!</h1>
            <p className="text-green-100 text-sm mt-2">
              A confirmation email has been sent to your email address
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 mb-5">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Booking Reference</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{bookingRef}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-sky-600" fill="currentColor" />
              </div>
            </div>

            <div className="relative h-40 rounded-xl overflow-hidden bg-slate-100 mb-5">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white font-semibold">{vehicle.name}</p>
              </div>
            </div>

            <div className="space-y-3">
              <DetailRow icon={ServiceIcon} label="Service">
                {searchParams.serviceType === "transfer"
                  ? "Airport Transfer"
                  : searchParams.serviceType === "car_hire"
                  ? "Car Hire"
                  : "Airport Parking"}
              </DetailRow>
              <DetailRow icon={MapPin} label="Location">
                {searchParams.pickupLocation}
                {searchParams.dropoffLocation && ` → ${searchParams.dropoffLocation}`}
              </DetailRow>
              <DetailRow icon={Calendar} label="Date">
                {searchParams.pickupDate}
                {searchParams.returnDate && ` → ${searchParams.returnDate}`}
              </DetailRow>
              <DetailRow icon={Clock} label={searchParams.serviceType === "parking" ? "Entry Time" : "Pick-up Time"}>
                {searchParams.pickupTime}
              </DetailRow>
              {searchParams.roundTrip && (
                <>
                  <DetailRow icon={Calendar} label={searchParams.serviceType === "transfer" ? "Return Date" : searchParams.serviceType === "car_hire" ? "Vehicle Return" : "Parking Exit"}>
                    {searchParams.returnDate}
                  </DetailRow>
                  <DetailRow icon={Clock} label={searchParams.serviceType === "parking" ? "Exit Time" : "Return Time"}>
                    {searchParams.returnTime}
                  </DetailRow>
                  <DetailRow icon={Plane} label="Booking Period">
                    {searchParams.serviceType === "transfer" ? "Round Trip (Both Ways)" : searchParams.serviceType === "car_hire" ? "Return Vehicle" : "Parking Entry & Exit"}
                  </DetailRow>
                </>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-slate-200 flex justify-between items-center">
              <span className="text-base font-semibold text-slate-900">Total Paid</span>
              <span className="text-2xl font-bold text-slate-900">
                {formatPrice(totalUSD, currency)}
              </span>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                Download Voucher
              </button>
              <button
                onClick={onHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Plane;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-slate-800 text-sm font-medium mt-0.5">{children}</p>
      </div>
    </div>
  );
}
