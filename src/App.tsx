import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { SearchResults } from "./components/SearchResults";
import { Checkout } from "./components/Checkout";
import { Confirmation } from "./components/Confirmation";
import { Destinations } from "./components/Destinations";
import { HowItWorks } from "./components/HowItWorks";
import { Testimonials } from "./components/Testimonials";
import { Footer } from "./components/Footer";
import { ChatWidget } from "./components/ChatWidget";
import { ManageBooking } from "./components/ManageBooking";
import { InfoPage } from "./components/InfoPage";
import type { Vehicle, SearchParams, ServiceType } from "./lib/types";

type View = "home" | "results" | "checkout" | "confirmation" | "manage_booking" | "cancellation" | "terms";

export default function App() {
  const [currency, setCurrency] = useState("USD");
  const [view, setView] = useState<View>("home");
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingRef, setBookingRef] = useState("");
  const [defaultService, setDefaultService] = useState<ServiceType>("transfer");

  useEffect(() => {
    const saved = localStorage.getItem("zippygo-currency");
    if (saved) setCurrency(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("zippygo-currency", currency);
  }, [currency]);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setView("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setView("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookingComplete = (ref: string) => {
    setBookingRef(ref);
    setView("confirmation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (section: string) => {
    if (section === "home") {
      setView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (section === "transfers") {
      setDefaultService("transfer");
      setView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (section === "car_hire") {
      setDefaultService("car_hire");
      setView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (section === "parking") {
      setDefaultService("parking");
      setView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (section === "manage_booking") {
      setView("manage_booking");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (section === "cancellation") {
      setView("cancellation");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (section === "terms") {
      setView("terms");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDestinationSelect = (destination: string) => {
    const params: SearchParams = {
      serviceType: "transfer",
      pickupLocation: destination,
      dropoffLocation: "",
      pickupDate: new Date().toISOString().split("T")[0],
      pickupTime: "10:00",
      returnDate: "",
      returnTime: "",
      roundTrip: false,
      passengers: 1,
    };
    setSearchParams(params);
    setView("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const computeTotalUSD = (): number => {
    if (!selectedVehicle || !searchParams) return 0;
    const MARGIN = 1.05;
    const pax = Math.max(searchParams.passengers, 1);
    const days = (() => {
      if (searchParams.returnDate && searchParams.pickupDate) {
        const diff = Math.ceil(
          (new Date(searchParams.returnDate).getTime() - new Date(searchParams.pickupDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        return Math.max(diff, 1);
      }
      return 1;
    })();

    if (searchParams.serviceType === "transfer") {
      const vehiclePrice = selectedVehicle.basePriceUSD * selectedVehicle.transferMultiplier * MARGIN;
      const totalVehicle = searchParams.roundTrip ? vehiclePrice * 2 : vehiclePrice;
      return totalVehicle / pax;
    } else if (searchParams.serviceType === "car_hire") {
      return selectedVehicle.basePriceUSD * selectedVehicle.carHireDailyMultiplier * MARGIN * days;
    } else {
      return selectedVehicle.parkingDailyUSD * MARGIN * days;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header currency={currency} onCurrencyChange={setCurrency} onNavigate={handleNavigate} />

      {view === "home" && (
        <>
          <Hero onSearch={handleSearch} defaultService={defaultService} />
          <Destinations onSelect={handleDestinationSelect} />
          <HowItWorks />
          <Testimonials />
        </>
      )}

      {view === "results" && searchParams && (
        <SearchResults
          searchParams={searchParams}
          currency={currency}
          onSelectVehicle={handleSelectVehicle}
          onBack={() => setView("home")}
        />
      )}

      {view === "checkout" && selectedVehicle && searchParams && (
        <Checkout
          vehicle={selectedVehicle}
          searchParams={searchParams}
          currency={currency}
          onBack={() => setView("results")}
          onComplete={handleBookingComplete}
        />
      )}

      {view === "confirmation" && selectedVehicle && searchParams && (
        <Confirmation
          bookingRef={bookingRef}
          vehicle={selectedVehicle}
          searchParams={searchParams}
          currency={currency}
          totalUSD={computeTotalUSD()}
          onHome={() => handleNavigate("home")}
        />
      )}

      {view === "manage_booking" && (
        <ManageBooking currency={currency} onBack={() => handleNavigate("home")} />
      )}

      {view === "cancellation" && (
        <InfoPage
          title="Cancellation Policy"
          onBack={() => handleNavigate("home")}
          sections={[
            {
              heading: "48-Hour Free Cancellation",
              body: "You may cancel your booking free of charge up to 48 hours before your scheduled pick-up / arrival time. A full refund will be issued to your original payment method within 5–7 business days.",
            },
            {
              heading: "Late Cancellation (Within 48 Hours)",
              body: "Cancellations made within 48 hours of the scheduled pick-up time are non-refundable. The full booking amount will be charged.",
            },
            {
              heading: "No-Show Policy",
              body: "If the driver arrives at the pick-up point and the passenger is not present within 60 minutes of the scheduled time, the booking is treated as a no-show and is non-refundable.",
            },
            {
              heading: "How to Cancel",
              body: "To cancel a booking, use the Manage My Booking page with your booking reference and email address, or contact us via the live chat widget. You will receive a cancellation confirmation email once the process is complete.",
            },
            {
              heading: "Flight Delays & Changes",
              body: "If your flight is delayed or rescheduled, we will adjust your pick-up time at no extra charge provided you inform us at least 2 hours before the original scheduled time via chat or by updating your booking.",
            },
          ]}
        />
      )}

      {view === "terms" && (
        <InfoPage
          title="Terms of Service"
          onBack={() => handleNavigate("home")}
          sections={[
            {
              heading: "1. Booking & Payment",
              body: "By completing a booking you agree to pay the full amount shown at checkout. All prices are displayed per person for transfer services and include applicable taxes. Payment is processed securely via Razorpay.",
            },
            {
              heading: "2. Service Scope",
              body: "ZippyGo provides airport transfers, car hire, and airport parking services. Transfer prices are quoted per person for one-way or return trips. Return trips must be used within 30 days of the first leg.",
            },
            {
              heading: "3. Passenger Responsibilities",
              body: "Passengers must be ready at the agreed pick-up location and time. You are responsible for providing accurate flight details, contact information, and luggage counts at the time of booking.",
            },
            {
              heading: "4. Vehicle & Driver",
              body: "ZippyGo reserves the right to substitute a vehicle of equal or higher class if the booked vehicle becomes unavailable. All drivers are licensed, insured, and background-checked.",
            },
            {
              heading: "5. Liability",
              body: "ZippyGo is not liable for delays caused by traffic, weather, road closures, or events beyond our control. Our liability is limited to the amount paid for the booking.",
            },
            {
              heading: "6. Privacy",
              body: "Your personal data is stored securely and used only for booking management and communication. We do not share your data with third parties except as required for service fulfilment (e.g. payment processing).",
            },
            {
              heading: "7. Amendments",
              body: "Booking details may be amended up to 24 hours before the scheduled pick-up time at no charge, subject to availability. Contact us via live chat to request changes.",
            },
            {
              heading: "8. Governing Law",
              body: "These terms are governed by the laws of the jurisdiction in which the service is provided. Any disputes shall be resolved in the courts of that jurisdiction.",
            },
          ]}
        />
      )}

      <Footer onNavigate={handleNavigate} />
      <ChatWidget onManageBooking={() => handleNavigate("manage_booking")} />
    </div>
  );
}
