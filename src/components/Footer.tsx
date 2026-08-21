import {
  Zap,
  Plane,
  Car,
  ParkingCircle,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Phone,
} from "lucide-react";

interface FooterProps {
  onNavigate: (section: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const serviceItems = [
    {
      label: "Airport Transfers",
      icon: Plane,
      section: "transfers",
      description: "Direct door-to-door private airport pickups with flight tracking.",
    },
    {
      label: "Car Hire",
      icon: Car,
      section: "car_hire",
      description: "Self-drive rentals with flexible pickup and unlimited mileage.",
    },
    {
      label: "Airport Parking",
      icon: ParkingCircle,
      section: "parking",
      description: "Secure terminal & off-site reserved parking with 24/7 CCTV.",
    },
  ];

  const companyLinks = [
    { label: "About Us", section: "about" },
    { label: "Careers", section: "careers" },
    { label: "Press", section: "press" },
    { label: "Blog", section: "blog" },
  ];

  const supportLinks = [
    { label: "Help Center", section: "help" },
    { label: "Manage My Booking", section: "manage_booking" },
    { label: "Cancellation Policy", section: "cancellation" },
    { label: "Terms of Service", section: "terms" },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
                <Zap className="w-6 h-6 text-white" fill="white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">
                  Zippy<span className="text-sky-400">Go</span>
                </span>
                <p className="text-[10px] text-slate-500 -mt-1 tracking-wider uppercase">
                  Worldwide Transfers
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Your trusted partner for airport transfers, car hire, and parking
              in 180+ countries. Book in minutes, travel with confidence.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> Available in 12+ currencies
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> Live chat support 24/7
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:+919177902449"
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-sky-400" />
                  +91 9177902449
                </a>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-sky-500 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Services Section with Descriptions */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Services
            </h4>
            <ul className="space-y-4">
              {serviceItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label} className="group">
                    <button
                      onClick={() => onNavigate(item.section)}
                      className="text-sm text-slate-300 hover:text-sky-400 transition-colors text-left font-medium flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4 text-sky-400" />
                      {item.label}
                    </button>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => onNavigate(item.section)}
                    className="text-sm hover:text-white transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => onNavigate(item.section)}
                    className="text-sm hover:text-white transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 ZippyGo. All rights reserved. ZippyGo is owned and operated
            by <strong>Zippygo Transfers</strong>.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <button
              onClick={() => onNavigate("privacy")}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate("terms")}
              className="hover:text-white transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => onNavigate("cookies")}
              className="hover:text-white transition-colors"
            >
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
