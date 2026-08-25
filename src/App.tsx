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
import { setSeo, getPageForView } from "./lib/seo";
import { DEFAULT_CURRENCY } from "./lib/currencies";

type View =
  | "home"
  | "results"
  | "checkout"
  | "confirmation"
  | "manage_booking"
  | "cancellation"
  | "terms"
  | "privacy"
  | "about"
  | "careers"
  | "press"
  | "blog";

// ==================== COMPANY & INFORMATION VIEWS ====================

function AboutUsView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">About Us</h1>
      <p className="mb-4">
        Welcome to <strong>ZippyGo</strong>, owned and operated by{" "}
        <strong>Zippygo Transfers</strong>. We are a global transportation and mobility platform providing seamless airport transfers, car rentals, and airport parking solutions in over 180 countries and 900+ airports worldwide.
      </p>
      <p className="mb-4">
        Our mission is to make travel hassle-free, transparent, and accessible to everyone. Whether you are traveling for business, a family vacation, or a solo getaway, ZippyGo connects you with trusted local drivers and transport partners for a safe and comfortable journey.
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-3">Why Travelers Choose ZippyGo</h2>
      <ul className="list-disc pl-5 space-y-2 mb-6">
        <li><strong>Global Coverage:</strong> Available across 900+ major airports around the globe.</li>
        <li><strong>Fixed & Transparent Pricing:</strong> No hidden costs or surge pricing during high demand.</li>
        <li><strong>24/7 Support:</strong> Our dedicated customer care team is available around the clock.</li>
        <li><strong>Flexible Booking:</strong> Enjoy free cancellation up to 24 hours before your scheduled ride.</li>
      </ul>
    </div>
  );
}

function CareersView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Careers at ZippyGo</h1>
      <p className="mb-6">
        At <strong>Zippygo Transfers</strong>, we are building the future of worldwide airport transfer and ground mobility services. We are looking for passionate, driven individuals to join our growing global team.
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-4">Open Positions</h2>
      <div className="space-y-4">
        <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm">
          <h3 className="font-semibold text-lg text-slate-900">Full-Stack React Developer</h3>
          <p className="text-sm text-slate-500 mb-2">Remote • Engineering</p>
          <p className="text-sm text-slate-600 mb-3">
            Help us build high-performance, intuitive web applications and seamless checkout experiences for hundreds of thousands of global travelers.
          </p>
          <button className="text-sm font-medium text-blue-600 hover:underline">View Role & Apply →</button>
        </div>

        <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm">
          <h3 className="font-semibold text-lg text-slate-900">Customer Success Specialist</h3>
          <p className="text-sm text-slate-500 mb-2">Remote / Hybrid • Operations</p>
          <p className="text-sm text-slate-600 mb-3">
            Assist our international travelers and driver partners with real-time support, route management, and booking inquiries.
          </p>
          <button className="text-sm font-medium text-blue-600 hover:underline">View Role & Apply →</button>
        </div>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        Don't see a role that fits your skill set? Email your CV to <strong>careers@zippygotransfers.com</strong>.
      </p>
    </div>
  );
}

function PressView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Press & Media</h1>
      <p className="mb-6">
        Welcome to the <strong>Zippygo Transfers</strong> Press Room. Here you can find company news, media assets, official announcements, and press release archives.
      </p>

      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-4">Recent News & Highlights</h2>
      <div className="space-y-4 mb-8">
        <article className="border-b border-slate-200 pb-4">
          <span className="text-xs text-slate-500">July 2026</span>
          <h3 className="font-semibold text-lg text-slate-900 hover:text-blue-600 cursor-pointer">
            ZippyGo Expands Airport Transfer Services Across 50 New Asian Hubs
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Zippygo Transfers announces strategic partner expansion, bringing fixed-rate transfer options to major airports across East and Southeast Asia.
          </p>
        </article>

        <article className="border-b border-slate-200 pb-4">
          <span className="text-xs text-slate-500">March 2026</span>
          <h3 className="font-semibold text-lg text-slate-900 hover:text-blue-600 cursor-pointer">
            ZippyGo Reaches Milestone of 250,000 Successful Worldwide Transfers
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Global traveler satisfaction reaches an all-time high as ZippyGo releases automated flight tracking and instant driver dispatching.
          </p>
        </article>
      </div>

      <div className="bg-slate-100 p-6 rounded-lg">
        <h3 className="font-semibold text-slate-900 mb-2">Media & PR Inquiries</h3>
        <p className="text-sm text-slate-600">
          For interview requests, high-res brand logos, or press kit assets, please reach out to our press relations team at <strong>press@zippygotransfers.com</strong>.
        </p>
      </div>
    </div>
  );
}

function BlogView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">ZippyGo Travel Blog</h1>
      <p className="text-slate-500 mb-8">Tips, guides, and insights to make your airport transfers and journeys effortless.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
          <div className="p-5 flex-grow">
            <span className="text-xs text-blue-600 font-semibold tracking-wide uppercase">Travel Tips</span>
            <h2 className="font-bold text-xl text-slate-900 mt-2 mb-2">
              10 Tips for Stress-Free Airport Transfers
            </h2>
            <p className="text-sm text-slate-600">
              Navigating busy international airports can be overwhelming. Learn how advance booking and flight tracking eliminate travel anxiety.
            </p>
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            5 min read
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
          <div className="p-5 flex-grow">
            <span className="text-xs text-blue-600 font-semibold tracking-wide uppercase">City Guides</span>
            <h2 className="font-bold text-xl text-slate-900 mt-2 mb-2">
              Navigating London LHR to Central City
            </h2>
            <p className="text-sm text-slate-600">
              Comparing Heathrow Express, taxis, Underground, and private chauffeur options to find the best route for your budget.
            </p>
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            4 min read
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== LEGAL & POLICY VIEWS ====================

function CancellationPolicyView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Cancellation & Refund Policy</h1>
      <p className="mb-4">
        This Cancellation and Refund Policy applies to all bookings made through our platform, operated by <strong>Zippygo Transfers</strong> ("ZippyGo", "we", "us", or "our").
      </p>
      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">1. Free Cancellation</h2>
      <p className="mb-4">
        You may cancel your booking free of charge up to 24 hours prior to the scheduled pickup time. Standard full refunds will be credited back to your original payment method within 5–7 business days.
      </p>
      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">2. Late Cancellations & No-Shows</h2>
      <p className="mb-4">
        Cancellations made within 24 hours of the pickup time or failure to show up at the designated pickup location may not be eligible for a refund.
      </p>
      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">3. Refund Processing</h2>
      <p className="mb-4">
        All approved refunds are processed automatically through our payment gateway partner (Razorpay) to the original card or bank account used during checkout.
      </p>
    </div>
  );
}

function TermsOfServiceView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
      <p className="mb-4">
        This website and service are owned and operated by <strong>Zippygo Transfers</strong> (doing business as "ZippyGo"). By accessing or using our website, you agree to be bound by these Terms of Service.
      </p>
      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">1. Booking & Payments</h2>
      <p className="mb-4">
        All bookings placed through ZippyGo are subject to confirmation and vehicle availability. Payments are securely processed via authorized payment gateway partners including Razorpay.
      </p>
      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">2. User Obligations</h2>
      <p className="mb-4">
        Users must provide accurate passenger and contact details when submitting a booking request. Failure to provide accurate details may result in service delay or booking cancellation without refund.
      </p>
      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">3. Governing Law</h2>
      <p className="mb-4">
        These terms shall be governed by and construed in accordance with the laws applicable to <strong>Zippygo Transfers</strong>.
      </p>
    </div>
  );
}

function PrivacyPolicyView() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
      <p className="mb-4">
        <strong>Zippygo Transfers</strong> ("ZippyGo", "we", "us", or "our") respects your privacy and is committed to protecting your personal data.
      </p>
      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">1. Information We Collect</h2>
      <p className="mb-4">
        We collect personal details such as your name, email address, phone number, and travel details required to confirm and fulfill your booking.
      </p>
      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">2. Payment Security</h2>
      <p className="mb-4">
        We do not directly store your credit/debit card credentials. All financial transactions are handled via encrypted payment gateway interfaces (Razorpay) conforming to PCI-DSS standards.
      </p>
      <h2 className="text-xl font-semibold text-slate-900 mt-6 mb-3">3. Contact Us</h2>
      <p className="mb-4">
        For any privacy concerns or inquiries, please contact our support team at support@zippygotransfers.com.
      </p>
    </div>
  );
}

// ==================== MAIN APPLICATION COMPONENT ====================

export default function App() {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  const [view, setView] = useState<View>(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    return service === "car_hire" || service === "parking" || service === "transfer" ? "home" : "home";
  });
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bookingRef, setBookingRef] = useState("");
  const [confirmationTotal, setConfirmationTotal] = useState(0);
  const [defaultService, setDefaultService] = useState<ServiceType>(() => {
    const service = new URLSearchParams(window.location.search).get("service");
    return service === "car_hire" || service === "parking" || service === "transfer" ? service : "transfer";
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const service = params.get("service");
    if (service === "transfer") setSeo("transfers");
    else if (service === "car_hire") setSeo("car_hire");
    else if (service === "parking") setSeo("parking");
    else setSeo(getPageForView(view));
  }, [view]);


  // Restore the booking after Razorpay redirects the customer back to ZippyGo.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment_status");
    if (!paymentStatus) return;

    const raw = localStorage.getItem("zippygo-pending-payment");
    if (raw) {
      try {
        const pending = JSON.parse(raw);
        if (pending?.vehicle && pending?.searchParams && pending?.bookingRef) {
          setBookingRef(pending.bookingRef);
          setConfirmationTotal(Number(pending.totalAmount) || 0);
          setCurrency(DEFAULT_CURRENCY);
          setSelectedVehicle(pending.vehicle);
          setSearchParams(pending.searchParams);
          if (paymentStatus === "success") {
            setView("confirmation");
            localStorage.removeItem("zippygo-pending-payment");
          }
        }
      } catch (restoreError) {
        console.error("Unable to restore Razorpay payment state:", restoreError);
      }
    }

    // Remove gateway query parameters from the address bar.
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);


  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleSearch = (params: SearchParams) => {
    const enrichedParams: SearchParams = {
      ...params,
      currency: DEFAULT_CURRENCY,
    };

    setSearchParams(enrichedParams);
    setCurrency(DEFAULT_CURRENCY);
    setView("results");
  };

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setView("checkout");
  };

  const handleNavigateToService = (service: ServiceType) => {
    setDefaultService(service);
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigateView = (section: string) => {
    if (section === "transfers" || section === "car_hire" || section === "parking") {
      setDefaultService(section as ServiceType);
      setView("home");
      return;
    }
    if (section === "help") {
      setView("home");
      return;
    }
    if (["home", "results", "checkout", "confirmation", "manage_booking", "cancellation", "terms", "privacy", "about", "careers", "press", "blog"].includes(section)) {
      setView(section as View);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      <Header onNavigate={handleNavigateView} />

      <main className="flex-grow">
        {view === "home" && (
          <>
            <Hero onSearch={handleSearch} defaultService={defaultService} />
            <Destinations onSelect={() => handleNavigateToService("transfer")} />
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
          />
        )}

        {view === "confirmation" && searchParams && selectedVehicle && (
          <Confirmation
            bookingRef={bookingRef}
            searchParams={searchParams}
            vehicle={selectedVehicle}
            currency={currency}
            totalUSD={confirmationTotal}
            onHome={() => setView("home")}
          />
        )}

        {view === "manage_booking" && <ManageBooking currency={currency} onBack={() => setView("home")} />}

        {/* Informational Views */}
        {view === "about" && <AboutUsView />}
        {view === "careers" && <CareersView />}
        {view === "press" && <PressView />}
        {view === "blog" && <BlogView />}

        {/* Policy Views */}
        {view === "cancellation" && <CancellationPolicyView />}
        {view === "terms" && <TermsOfServiceView />}
        {view === "privacy" && <PrivacyPolicyView />}
      </main>

      <Footer onNavigate={handleNavigateView} />
      <ChatWidget />
    </div>
  );
}
