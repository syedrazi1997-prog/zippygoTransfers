import { useState, useEffect, useRef } from "react";
import { Plane, Car, ParkingCircle, Globe, Menu, X, Zap, Briefcase } from "lucide-react";
import { CURRENCIES } from "../lib/currencies";

interface HeaderProps {
  currency: string;
  onCurrencyChange: (code: string) => void;
  onNavigate: (section: string) => void;
}

export function Header({ currency, onCurrencyChange, onNavigate }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const navItems = [
    { label: "Airport Transfers", icon: Plane, section: "transfers" },
    { label: "Car Hire", icon: Car, section: "car_hire" },
    { label: "Airport Parking", icon: ParkingCircle, section: "parking" },
    { label: "My Booking", icon: Briefcase, section: "manage_booking" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 text-white" fill="white" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-xl font-bold text-white tracking-tight">
                Zippy<span className="text-sky-400">Go</span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-1 tracking-wider uppercase">
                Worldwide Transfers
              </p>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.section}
                onClick={() => onNavigate(item.section)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div ref={currencyRef} className="relative">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-sm font-medium border border-white/10"
              >
                <Globe className="w-4 h-4" />
                <span>{currency}</span>
              </button>
              {currencyOpen && (
                <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-xl bg-white shadow-2xl border border-slate-200 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onCurrencyChange(c.code);
                        setCurrencyOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-slate-100 transition-colors ${
                        currency === c.code
                          ? "bg-sky-50 text-sky-700 font-semibold"
                          : "text-slate-700"
                      }`}
                    >
                      <span>
                        <span className="font-medium">{c.code}</span>
                        <span className="text-slate-400 ml-2">{c.name}</span>
                      </span>
                      <span className="text-slate-500">{c.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden pb-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.section}
                onClick={() => {
                  onNavigate(item.section);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
