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
import type { Vehicle, SearchParams, ServiceType } from "./lib/types";

type View =
  | "home"
  | "results"
  | "checkout"
  | "confirmation"
  | "manage_booking"
  | "cancellation"
  | "terms"
  | "privacy";

// Inline Policy Components tailored for Cashfree Merchant Onboarding Compliance
function CancellationPolicyView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Cancellation & Refund Policy
      </h1>
      <p className="mb-4">
        This Cancellation and Refund Policy applies to all bookings made through
        our platform, operated by <strong>Zippygo Transfers</strong> ("ZippyGo",
        "we", "us", or "our").
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
        1. Free Cancellation
      </h2>
      <p className="mb-4">
        You may cancel your booking free of charge up to 24 hours prior to the
        scheduled pickup time. Standard full refunds will be credited back to
        your original payment method within 5–7 business days.
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
        2. Late Cancellations & No-Shows
      </h2>
      <p className="mb-4">
        Cancellations made within 24 hours of the pickup time or failure to show
        up at the designated pickup location may not be eligible for a refund.
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
        3. Refund Processing
      </h2>
      <p className="mb-4">
        All approved refunds are processed automatically through our payment
        gateway partner (Cashfree) to the original card or bank account used
        during checkout.
      </p>
    </div>
  );
}

function TermsOfServiceView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
      <p className="mb-4">
        This website and service are owned and operated by{" "}
        <strong>Zippygo Transfers</strong> (doing business as "ZippyGo"). By
        accessing or using our website, you agree to be bound by these Terms of
        Service.
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
        1. Booking & Payments
      </h2>
      <p className="mb-4">
        All bookings placed through ZippyGo are subject to confirmation and
        vehicle availability. Payments are securely processed via authorized
        payment gateway partners including Cashfree.
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
        2. User Obligations
      </h2>
      <p className="mb-4">
        Users must provide accurate passenger and contact details when submitting
        a booking request. Failure to provide accurate details may result in service
        delay or booking cancellation without refund.
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
        3. Governing Law
      </h2>
      <p className="mb-4">
        These terms shall be governed by and construed in accordance with the laws
        applicable to <strong>Zippygo Transfers</strong>.
      </p>
    </div>
  );
}

function PrivacyPolicyView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
      <p className="mb-4">
        <strong>Zippygo Transfers</strong> ("ZippyGo", "we", "us", or "our")
        respects your privacy and is committed to protecting your personal data.
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
        1. Information We Collect
      </h2>
      <p className="mb-4">
        We collect personal details such as your name, email address, phone number,
        and travel details required to confirm and fulfill your booking.
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
        2. Payment Security
      </h2>
      <p className="mb-4">
        We do not directly store your credit/debit card credentials. All financial
        transactions are handled via encrypted payment gateway interfaces (Cashfree)
        conforming to PCI-DSS standards.
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">
        3. Contact Us
      </h2>
      <p className="mb-4">
        For any privacy concerns or inquiries, please contact our support team at
        support@zippygotransfers.com.
      </p>
    </div>
  );
}

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

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setView("results");
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setView("checkout");
  };

  const handleBookingComplete = (ref: string) => {
    setBookingRef(ref);
    setView("confirmation");
  };

  const handleNavigateToService = (service: ServiceType) => {
    setDefaultService(service);
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateView = (newView: View) => {
    setView(newView);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        onNavigateHome={() => setView("home")}
        onNavigateManageBooking={() => setView("manage_booking")}
      />

      <main className="flex-grow">
        {view === "home" && (
          <>
            <Hero onSearch={handleSearch} defaultService={defaultService} />
            <Destinations onSelectDestination={handleNavigateToService} />
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
            onComplete={handleBookingComplete}
            onBack={() => setView("results")}
          />
        )}

        {view === "confirmation" && searchParams && selectedVehicle && (
          <Confirmation
            bookingRef={bookingRef}
            searchParams={searchParams}
            vehicle={selectedVehicle}
            currency={currency}
            onHome={() => setView("home")}
          />
        )}

        {view === "manage_booking" && <ManageBooking currency={currency} />}

        {/* Policy Views */}
        {view === "cancellation" && <CancellationPolicyView />}
        {view === "terms" && <TermsOfServiceView />}
        {view === "privacy" && <PrivacyPolicyView />}
      </main>

      <Footer onNavigateView={handleNavigateView} />
      <ChatWidget />
    </div>
  );
}
